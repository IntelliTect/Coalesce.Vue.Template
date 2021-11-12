import path from "path";
import { defineConfig, ViteDevServer } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import { spawn } from "child_process";

const { keyFilePath, certFilePath } = getCertPaths();

async function writeHtml(server: ViteDevServer) {
  const filename = server.config.root + "/index.html";
  if (existsSync(filename)) {
    let html = readFileSync(filename, "utf-8");
    html = await server.transformIndexHtml("/index.html", html, "/");
    writeFile(
      path.join(server.config.root, server.config.build.outDir, "index.html"),
      html,
      "utf-8",
      () => {
        /*nothing*/
      }
    );
    server.config.logger.info(
      `Wrote index.html to ${server.config.build.outDir}`
    );
  }
}

export default defineConfig(async ({ command, mode }) => ({
  build: {
    outDir: "wwwroot",
  },
  base: command == "serve" ? "/vite_hmr/" : "/",
  plugins: [
    createVuePlugin(),
    {
      name: "aspnetcore-hmr",
      async handleHotUpdate(ctx) {
        if (ctx.server.config.root + "/index.html" == ctx.file) {
          writeHtml(ctx.server);
        }
      },
      async configureServer(server) {
        const parentPid = process.env.ASPNETCORE_VITE_PID;
        if (!parentPid) return;
        setInterval(async function () {
          let parentExists = true;
          try {
            // Sending signal 0 - on all platforms - tests whether the process exists. As long as it doesn't
            // throw, that means it does exist.
            process.kill(+parentPid, 0);
            parentExists = true;
          } catch (ex) {
            // If the reason for the error is that we don't have permission to ask about this process,
            // report that as a separate problem.
            if (ex.code === "EPERM") {
              throw new Error(
                `Attempted to check whether process ${parentPid} was running, but got a permissions error.`
              );
            }
            parentExists = false;
          }

          if (!parentExists) {
            try {
              await server.close();
            } finally {
              process.exit(0);
            }
          }
        }, 1000);

        writeHtml(server);
      },
    },
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
}));

function getCertPaths() {
  const baseFolder =
    process.env.APPDATA !== undefined && process.env.APPDATA !== ""
      ? `${process.env.APPDATA}/ASP.NET/https`
      : `${process.env.HOME}/.aspnet/https`;

  const certificateArg = process.argv
    .map((arg) => arg.match(/--name=(?<value>.+)/i))
    .filter(Boolean)[0];
  const certificateName = certificateArg
    ? certificateArg.groups.value
    : process.env.npm_package_name;

  if (!certificateName) {
    console.error(
      "Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly."
    );
    process.exit(-1);
  }

  const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
  const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

  if (!existsSync(certFilePath) || !existsSync(keyFilePath)) {
    spawn(
      "dotnet",
      [
        "dev-certs",
        "https",
        "--export-path",
        certFilePath,
        "--format",
        "Pem",
        "--no-password",
      ],
      { stdio: "inherit" }
    ).on("exit", (code) => process.exit(code));
  }

  return {
    certFilePath,
    keyFilePath,
  };
}
