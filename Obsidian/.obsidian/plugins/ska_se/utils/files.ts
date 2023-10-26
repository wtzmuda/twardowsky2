import { TFile, App } from "obsidian";
import pluginHandler from "./globalHandlers";

export async function removeError(file: TFile, app: App) {
	await app.fileManager.renameFile(
		file,
		file.path.split("❌").join("").trim()
	);
}
export async function removeWarning(file: TFile, app: App) {
	await app.fileManager.renameFile(
		file,
		file.path.split("⚠️").join("").trim()
	);
}
export async function addError(file: TFile, app: App) {
	if (file.path.includes("❌")) return;
	await app.fileManager.renameFile(
		file,
		file.path.split(".md")[0].trim() + " ❌.md"
	);
}
export async function addWarning(file: TFile, app: App) {
	if (file.path.includes("⚠️")) return;
	await app.fileManager.renameFile(
		file,
		file.path.split(".md")[0].trim() + " ⚠️.md"
	);
}

export async function getSection(file: TFile, headingToSearch: string) {
	const app = pluginHandler.app;

	const { metadataCache, vault } = app;
	const headings = metadataCache.getFileCache(file)?.headings ?? [];
	let text = await vault.cachedRead(file);
	const hIdx = headings.findIndex(
		({ heading }: any) => heading === headingToSearch
	);
	if (hIdx === -1) {
		text = "";
	} else {
		text = text
			.split("\n")
			.slice(
				headings[hIdx].position.start.line + 1,
				headings[hIdx + 1]?.position?.start?.line
			)
			.join("\n")
			.trim();
	}

	console.log(text);

	return text;
}
