import path from "path";

import { defineConfig } from "vite";

import { createVuePlugin } from "vite-plugin-vue2";
import createCheckerPlugin from "vite-plugin-checker";
import createVueComponentImporterPlugin from "unplugin-vue-components/vite";
import { VuetifyResolver } from "unplugin-vue-components/resolvers";

import { createAspNetCoreHmrPlugin } from "coalesce-vue/lib/build";
import { CoalesceVuetifyResolver } from "coalesce-vue-vuetify/lib/build";

import { sassPlugin } from "esbuild-sass-plugin";

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
        dts: false,
        resolvers: [VuetifyResolver(), CoalesceVuetifyResolver()],
      }),

      // Integrations with UseViteDevelopmentServer from IntelliTect.Coalesce.Vue
      createAspNetCoreHmrPlugin({}),

      // Perform type checking during development and build time.
      createCheckerPlugin({
        // VLS: Vue Language Server, the language server portion of Vetur.
        vls: {
          vetur: {
            // Template validation is turned off because this mirrors the classic behavior of vue-cli.
            // However, modern syntax like the null propagating operator IS available in this configuration,
            // so these options can be turned on if desired.
            validation: {
              template: false,
              templateProps: false,
              interpolation: false,
            },
          },
        },
      }),

      // Exclude css when running vitest.
      // Can be removed once https://github.com/vitest-dev/vitest/pull/1467 is released.
      mode == "test"
        ? {
            name: "vitest-exclude-css",
            enforce: "pre",
            transform(code, id) {
              if (/\.(css|sass|scss|less|stylus)$/.test(id))
                return { code: "" };
            },
          }
        : undefined,
    ],

    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
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
        plugins: [
          sassPlugin({
            type: "style",
            ...sassOptions,
          }),
        ],
      },
    },

    test: <VitestInlineConfig>{
      globals: true,
      environment: "jsdom",
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
