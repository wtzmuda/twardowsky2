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

export async function insertMarkdownUnderHeading(
	file: TFile,
	headingToSearch: string,
	markdown: string,
	offset: number[] = [],
	offsetLine: number[] = []
): Promise<number[][]> {
	if (!markdown) markdown = "";
	const app = pluginHandler.app;

	const { metadataCache, vault } = app;
	const cache = metadataCache.getFileCache(file);
	const headings = cache?.headings ?? [];
	const sections = cache?.sections ?? [];
	let text = await vault.read(file);
	let dLength = text.length;

	const heading = headings.find(
		({ heading }: any) => heading === headingToSearch
	);
	if (!heading) {
		console.log("No heading found");
		return [offset, offsetLine];
	}

	const hIdx = sections.findIndex(
		({ position }: any) =>
			position.end.offset === heading.position.end.offset
	);
	// calculate the total offset by checking if the heading is below the offsetLine and if so, add the offset
	// to the total offset
	const totalOffset = offset?.reduce((acc, curr, idx) => {
		if (offsetLine && heading.position.start.line >= offsetLine[idx]) {
			return acc + curr;
		}
		return acc;
	}, 0);

	if (!sections[hIdx + 1] || sections[hIdx + 1].type === "heading") {
		console.log("here");
		// put the data directly under the heading
		text =
			text.slice(0, heading.position.end.offset + totalOffset) +
			markdown +
			text.slice(heading.position.end.offset + totalOffset);
	} else {
		// remove the data in this section and put the new data under the heading
		text =
			text.slice(0, heading.position.end.offset + totalOffset) +
			markdown +
			text.slice(
				sections[hIdx + 1].position.end.offset + 1 + totalOffset
			);
	}

	await app.vault.modify(file, text);

	// update the offsets and return
	offset.push(text.length - dLength);
	offsetLine?.push(heading.position.start.line);

	return [offset, offsetLine];
}
