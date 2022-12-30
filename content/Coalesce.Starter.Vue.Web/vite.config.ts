import path from "node:path";

import { defineConfig } from "vite";

import createVuePlugin from "@vitejs/plugin-vue2";
import createCheckerPlugin from "vite-plugin-checker";
import createVueComponentImporterPlugin from "unplugin-vue-components/vite";
import { VuetifyResolver } from "unplugin-vue-components/resolvers";
import { sassPlugin } from "esbuild-sass-plugin";

import { createAspNetCoreHmrPlugin } from "coalesce-vue/lib/build";
import { CoalesceVuetifyResolver } from "coalesce-vue-vuetify2/lib/build";

import type { InlineConfig as VitestInlineConfig } from "vitest";
import type { StringOptions } from "sass";

export default defineConfig(async ({ command, mode }) => {
  return {
    build: {
      outDir: "wwwroot",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.match(/home/i)) return "index";
            // All views are chunked together so that dynamic imports can be
            // used in `router.ts`(which makes for a much more readable file).
            // Without this, each dynamic import would get its own chunk.
            if (id.includes("views")) return "views";
            return "index";
          },
        },
      },
    },

    plugins: [
      createVuePlugin(),

      // Transforms usages of Vuetify and Coalesce components into treeshakable imports
      createVueComponentImporterPlugin({
        dts: false, // Note: DTS can't be enabled when vuetify2-component-types is installed.
        resolvers: [VuetifyResolver(), CoalesceVuetifyResolver()],
      }),

      // Integrations with UseViteDevelopmentServer from IntelliTect.Coalesce.Vue
      createAspNetCoreHmrPlugin(),

      // Perform type checking during development and build time.
      // Disable during test (vitest) because it isn't capable of emitting errors to vitest.
      mode !== "test" &&
        createCheckerPlugin({
          vueTsc: {
            tsconfigPath: "tsconfig.dev.json",
          },
        }),
    ],

    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },

    esbuild: {
      // vue-class-component uses the original names of classes as the component name.
      keepNames: true,
    },

    css: { preprocessorOptions: { sass: sassOptions } },

    optimizeDeps: {
      // The configuration for SASS here is so that Vuetify's styles
      // will be included in Vite's Dependency Pre-Bundling feature.
      // Without this, in serve mode there will be nearly 100 extra HTTP requests,
      // one for each individual Vuetify component's stylesheet.
      // See https://github.com/vitejs/vite/issues/7719
      extensions: [".scss", ".sass"],
      esbuildOptions: {
        // Sourcemaps are off because if they're not, when using the Search (CTRL+SHIFT+F)
        // feature in Chrome dev tools, hundreds of requests will be made to try and load the sourcemaps,
        // slowing down the search operation significantly.
        // Generally you don't want to sourcemap external dependencies anyway.
        sourcemap: false,
        plugins: [
          sassPlugin({
            type: "style",
            ...sassOptions,
          }) as any,
        ],
      },
    },

    test: <VitestInlineConfig>{
      globals: true,
      environment: "happy-dom",
      setupFiles: ["tests/setupTests.ts"],
      coverage: {
        exclude: ["**/*.g.ts", "test{,s}/**"],
      },
      deps: {
        inline: ["vuetify/lib"],
      },
    },
  };
});

const sassOptions: StringOptions<"sync"> = {
  quietDeps: true,
  // Logger warn override is a workaround for deprecation warning spam. See
  // https://github.com/sass/sass/issues/3065#issuecomment-868302160.
  // `quietDeps` is supposed to have the same effect, but doesn't work.
  logger: {
    warn(message, options) {
      if (
        (options.deprecation && options.stack?.includes("node_modules")) ||
        message.includes("repetitive deprecation")
      ) {
        return;
      }
      console.warn(
        `\x1b[33mSASS WARNING\x1b[0m: ${message}\n${
          options.stack === "null" ? "" : options.stack
        }\n`
      );
    },
  },
};
