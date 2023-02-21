import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";

const entrypointDir = path.join(__dirname, "../", "src", "entrypoints");
const distDir = path.join(__dirname, "../", "dist");

const run = async () => {
  try {
    await fs.mkdir(distDir);
  } catch (e) {
    // clean the dist directory
    const files = await fs.readdir(distDir);
    const promises: Promise<void>[] = [];
    for (const file of files) {
      promises.push(fs.unlink(path.join(distDir, file)));
    }
    await Promise.all(promises);
  }

  await buildMjs();
  await replaceJsExtensionWithMjs();
  await changeImportStatementsToMjs();
  await buildNormal();

};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


function buildNormal() {
  // build as a regular module (.js)
  return new Promise((resolve, reject) => {
    exec(
      `npx tsc --project tsconfig.json`,
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      },
    );
  });
}

async function replaceJsExtensionWithMjs() {
  const entrypoints = await fs.readdir(entrypointDir);
  const promises: Promise<void>[] = [];
  for (const entrypoint of entrypoints) {
    promises.push(fs.rename(
      path.join(distDir, entrypoint).replace(".ts", ".js"),
      path.join(distDir, entrypoint.replace(".ts", ".mjs")),
    ));
  }
  await Promise.all(promises);
}

async function changeImportStatementsToMjs() {
  const files = await fs.readdir(distDir);
  const promises: Promise<unknown>[] = [];
  for (const file of files) {
    const p = new Promise(async (resolve, reject) => {
      const filePath = path.join(distDir, file);
      const fileContents = await fs.readFile(filePath, "utf8").catch(reject);
      // find the end of imports like `from './result';` and replace the .js with .mjs, or add .mjs if it doesn't exist
      const newFileContents = fileContents?.replace(
        /from\s+['"](.*)(\.js)?['"]/g,
        "from '$1.mjs'",
      );
      // write the new file contents
      await fs.writeFile(filePath, newFileContents || '').catch(reject);
      resolve(true);
    });
    promises.push(p);
  }

  await Promise.all(promises);
}


function buildMjs() {
  // build as a module (.mjs)
  return new Promise((resolve, reject) => {
    exec(
      `npx tsc --project tsconfig.mjs.json`,
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      },
    );
  });
}