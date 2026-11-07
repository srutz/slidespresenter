import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export type PresentationManifestEntry = {
	id: string;
	slides: string[];
};

/**
 * Every sub-directory of public/ containing .md files is a presentation.
 * Slides are the .md files, sorted by file name. The list is exposed as
 * /presentations.json (served in dev, emitted on build).
 */
export function presentations(): Plugin {
	const publicDir = path.resolve(__dirname, "public");

	function scan(): PresentationManifestEntry[] {
		return fs
			.readdirSync(publicDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => ({
				id: d.name,
				slides: fs
					.readdirSync(path.join(publicDir, d.name))
					.filter((f) => f.endsWith(".md"))
					.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
			}))
			.filter((p) => p.slides.length > 0)
			.sort((a, b) => a.id.localeCompare(b.id));
	}

	return {
		name: "presentations-manifest",
		configureServer(server) {
			server.middlewares.use("/presentations.json", (_req, res) => {
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(scan()));
			});
		},
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "presentations.json",
				source: JSON.stringify(scan()),
			});
		},
	};
}
