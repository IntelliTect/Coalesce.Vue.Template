import path from "path";
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import { readFileSync } from "fs";
import checker from "vite-plugin-checker";
import { createAspNetCoreHmrPlugin, getCertPaths } from "coalesce-vue/lib/vite";

export default defineConfig(async ({ command, mode }) => {
  const { keyFilePath, certFilePath } = await getCertPaths();
  return {
    build: {
      outDir: "wwwroot",
    },
    base: command == "serve" ? "/vite_hmr/" : "/",
    plugins: [
      createVuePlugin(),
      createAspNetCoreHmrPlugin(),
      checker({
        vls: {
          /*
            TODO: These settings don't work yet.
            I submitted a PR to vite-plugin-checker. 
            Once that is merged and published and consumed here, this will work.
          */
          // Template validation is turned off because Vue2 doesn't support Typescript syntax inside of templates,
          // prohibiting the use of features like casts and non-null assertions.
          // These settings mirror the behavior of vue-cli.
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
    server: {
      https: {
        key: readFileSync(keyFilePath),
        cert: readFileSync(certFilePath),
      },
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "src"),
        },
      ],
    },
  };
});
