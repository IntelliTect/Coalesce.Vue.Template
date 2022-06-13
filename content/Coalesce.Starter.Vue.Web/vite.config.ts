import path from "path";
import { readFileSync } from "fs";

import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import { sassPlugin } from "esbuild-sass-plugin";
import checker from "vite-plugin-checker";
import vueComponentImporter from "unplugin-vue-components/vite";
import { VuetifyResolver } from "unplugin-vue-components/resolvers";

import {
  createAspNetCoreHmrPlugin,
  getCertPaths,
} from "coalesce-vue/lib/build";
import { CoalesceVuetifyResolver } from "coalesce-vue-vuetify/lib/build";
import type { StringOptions } from "sass";

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

export default defineConfig(async ({ command, mode }) => {
  const { keyFilePath, certFilePath } = await getCertPaths();
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
    base: command == "serve" ? "/vite_hmr/" : "/",
    css: { preprocessorOptions: { sass: sassOptions } },
    plugins: [
      createVuePlugin(),

      // Transforms usages of Vuetify and Coalesce components into treeshakable imports
      vueComponentImporter({
        dts: false,
        resolvers: [VuetifyResolver(), CoalesceVuetifyResolver()],
      }),

      // Integrations with IntelliTect.Coalesce.Vue.ViteDevelopmentServerMiddleware
      createAspNetCoreHmrPlugin(),

      // Perform type checking during development and build time.
      checker({
        // VLS: Vue Language Server, the language server portion of Vetur.
        vls: {
          // Template validation is turned off because Vue2 doesn't support
          // Typescript syntax inside of templates, prohibiting the use of
          // features like casts and non-null assertions  that would allow
          // for writing type-perfect code. These settings mirror the behavior
          // of vue-cli. If you want to try to write type-perfect code inside
          // templates, feel free to turn these on.
          vetur: {
            validation: {
              template: false,
              templateProps: false,
              interpolation: false,
            },
          },
        },
      }),
    ],
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    },

    // The development server launched by UseViteDevelopmentServer must be HTTPS
    // to avoid issues with mixed content:
    server: {
      https: {
        key: readFileSync(keyFilePath),
        cert: readFileSync(certFilePath),
      },
    },

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
  };
});
