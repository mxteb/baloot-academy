import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const basePath = "/baloot-academy/";
const serverEntry = pathToFileURL(resolve(root, "dist/server/index.js"));
const { default: worker } = await import(serverEntry.href);
const response = await worker.fetch(
  new Request("http://localhost/"),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
  throw new Error(`Static page render failed: ${response.status}`);
}

let html = await response.text();
if (!html.includes(`${basePath}assets/`)) {
  throw new Error(`Expected GitHub Pages asset paths under ${basePath}`);
}

html = html.replaceAll(
  "https://baloot-academy.slmdnk.chatgpt.site/",
  `https://mxteb.github.io${basePath}`,
);

await mkdir(resolve(root, "dist/client"), { recursive: true });
await writeFile(resolve(root, "dist/client/index.html"), html);
await writeFile(resolve(root, "dist/client/.nojekyll"), "");

console.log(`Exported ${html.length} bytes to dist/client/index.html for ${basePath}`);
