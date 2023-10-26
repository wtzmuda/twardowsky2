import OpenAI from "openai";

import {
	Pinecone,
	PineconeRecord,
	RecordMetadata,
} from "@pinecone-database/pinecone";
import pluginHandler from "./globalHandlers";
import { TFile, parseLinktext } from "obsidian";
import { addRequirement } from "./templates";
// import { requirementsDB } from "./databaseAdapter";

const pinecone = new Pinecone({
	apiKey: "81f56d81-b6ff-4af4-b3f5-3108d730bb88",
	environment: "gcp-starter",
});

const openai = new OpenAI({
	apiKey: "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", // defaults to process.env["OPENAI_API_KEY"]
	dangerouslyAllowBrowser: true,
});

async function getEmbedMarkdown({
	path,
	subpath,
}: {
	path: string;
	subpath: string;
}) {
	const { metadataCache, vault } = app;
	const file = metadataCache.getFirstLinkpathDest(path, "") as TFile;
	const headings = metadataCache.getFileCache(file)?.headings ?? [];
	let text = await vault.cachedRead(file);
	if (subpath) {
		const hIdx = headings.findIndex(
			({ heading }: any) => heading === subpath
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
	}
	return text
		.split("\n")
		.map((line: string) => `${line}`)
		.join("\n");
}

export async function requirementsTable(file: TFile) {
	const { dataview: dv } = pluginHandler.getPlugins();
	const app = pluginHandler.app;

	// get requirements list and collapse it. To do this: get metadatacache, find heading "Requirements",

	const cache = app.metadataCache.getCache(file.path);

	// add all positions in sections object to local storage in this format: {"folds":[{"from":65,"to":66}],"lines":68}

	const storageKey = Object.keys(window.localStorage).find((key) =>
		key.includes("note-fold-" + file.path)
	);

	// Retrieve current folds from localStorage
	const storedData = storageKey
		? JSON.parse(window.localStorage.getItem(storageKey ?? "") ?? "{}")
		: {
				folds: [],
				lines: 0,
		  };
	const existingFolds: { from: number; to: number }[] = storedData.folds;

	// Find the "Requirements" section position
	const requirementsSection = cache?.headings?.find(
		(h) => h.heading === "Requirements"
	);

	if (!requirementsSection) return;
	const reqListStartIndex = cache?.sections?.findIndex(
		(section) =>
			section.position.start.line ===
			requirementsSection.position.start.line
	);
	// Check if the "Requirements" section exists
	if (!reqListStartIndex) return;

	// Find lists within the "Requirements" section (for now it's next list in the cache)
	const listsInSection = cache?.sections?.filter(
		(_, index) => index === reqListStartIndex + 1
	);

	// Add these lists to the folds array
	listsInSection?.forEach((list) => {
		const foldStart = list.position.start.line;
		const foldEnd = list.position.end.line;

		// Check if the fold is already stored
		if (
			!existingFolds.some(
				(fold) => fold.from === foldStart && fold.to === foldEnd
			)
		) {
			// NOTE: This won't work if any list has more than one line of text
			// one could play around with cache.listItems to get the exact number of lines
			for (let i = 0; i < foldEnd - foldStart; i++) {
				existingFolds.push({
					from: foldStart + i,
					to: foldEnd + i + 1,
				});
			}
		}
	});

	const lines =
		cache?.sections?.[cache?.sections.length - 1]?.position.end.line ?? 0;

	const requirements = dv
		.pages('"Rocket Systems"')
		.where((p: any) => p.Class.includes("Requirement")).values;

	type DataItem = {
		file: {
			path: string;
			name: string;
		};
		[key: string]: any; // Other properties
	};

	type TreeNode = {
		[key: string]: TreeNode | { item: DataItem };
	};

	function createMarkdownList(data: DataItem[]): string {
		// Step 1: Create a tree structure
		const tree: TreeNode = {};

		data.forEach((item) => {
			const parts = item.file.path.split("/");
			// Remove 'Requirements' from the hierarchy
			// const filteredParts = parts.filter(
			// 	(part) => part !== "Requirements"
			// );
			const filteredParts = parts;
			let currentLevel: TreeNode | { item: DataItem } = tree;

			filteredParts.forEach((part, index) => {
				if (!(currentLevel as TreeNode)[part]) {
					(currentLevel as TreeNode)[part] = {};
				}
				// If this is the last part of the path, add the item reference
				if (index === filteredParts.length - 1) {
					(currentLevel as TreeNode)[part].item = item;
				}
				currentLevel = (currentLevel as TreeNode)[part];
			});
		});

		// Step 2: Recursively generate markdown list from the tree
		function generateList(node: TreeNode, level: number): string {
			let markdown = "";
			for (let key in node) {
				if (key !== "item") {
					// Directory
					markdown += "  ".repeat(level) + `- ${key}\n`;
					markdown += generateList(
						(node as TreeNode)[key],
						level + 1
					);
				} else if ((node as { item: DataItem }).item.file.name) {
					// File
					markdown +=
						"  ".repeat(level) +
						`- [[${
							(node as { item: DataItem }).item.file.name
						}]] \n`;
				}
			}
			return markdown;
		}

		return generateList(tree, 0);
	}

	// Usage:
	const dataList: DataItem[] = requirements;
	const markdownOutput = createMarkdownList(dataList);

	// append the markdownOutput to the file
	let data = await app.vault.read(file);
	const newData =
		data.slice(0, requirementsSection.position.end.offset) +
		"\n" +
		markdownOutput +
		data.slice(
			cache?.sections?.[reqListStartIndex + 1]
				? cache?.sections?.[reqListStartIndex + 1].position?.end?.offset
				: requirementsSection.position.end.offset
		);
	await app.vault.modify(file, newData);

	// Update the localStorage
	localStorage.setItem(
		storageKey ?? app.appId + "-note-fold-" + file.path,
		JSON.stringify({ folds: existingFolds, lines: lines + 1 })
	);
}

export function requirementsTable1(file: TFile) {
	const { dataview: dv } = pluginHandler.getPlugins();
	const app = pluginHandler.app;

	const container = document.createElement("div");
	container.classList.add("requirements-table-container");

	const parentReq = document.createElement("table");
	parentReq.style.width = "100%";

	const tableParentHead = document.createElement("thead");
	tableParentHead.innerHTML = `
		<tr>
			<th class="accordion requirements-table-parent requirements-table">▶ Parent Requirements</th>
		</tr>
	`;
	parentReq.appendChild(tableParentHead);
	const tableBody = document.createElement("tbody");
	tableBody.classList.add("requirements-table-parent", "requirement-panel");
	parentReq.appendChild(tableBody);

	// This variable contains all the requirements that belong to any of the parents of the current file
	const parentReqPages = dv
		.pages('"Requirements"')
		.where(
			(req: any) =>
				req.System.includes(
					app.metadataCache.getFileCache(file as TFile)?.frontmatter
						?.System
				) &&
				req.System !==
					app.metadataCache.getFileCache(file as TFile)?.frontmatter
						?.ID
		).values;

	parentReqPages.forEach(async (page: any) => {
		const value = await getEmbedMarkdown({
			path: page.file.path,
			subpath: "Description",
		});

		const tr = document.createElement("tr");
		tr.classList.add("requirement-row");
		tr.innerHTML = `<td colspan="80%">${value}</td><td><a class="internal-link" data-href="${
			page.file.path
		}">${page.file.path.split("/").pop()}</a></td>`;

		tableBody.appendChild(tr);

		if (page.Status.toLowerCase() === "conflict") {
			const cPopup = showConflict(tr, [value, "123"]);
			tr.onmouseenter = (ev) => {
				ev.stopPropagation();
				cPopup.style.display = "block";
			};
			tr.addEventListener("mouseout", (ev) => {
				ev.stopPropagation();
				cPopup.style.display = "none";
			});
		}
	});

	container.appendChild(parentReq);

	const thisReq = document.createElement("table");
	thisReq.style.width = "100%";

	const tableThisHead = document.createElement("thead");
	tableThisHead.style.position = "relative";
	tableThisHead.innerHTML = `
		<tr>
			<th class="accordion requirements-table-this requirements-table">
				▶ Element's Requirements
			</th>
		</tr>
		<span class="add-requirement-btn">+</span>
	`;
	thisReq.appendChild(tableThisHead);
	const tableThisBody = document.createElement("tbody");
	tableThisBody.classList.add("requirements-table-this", "requirement-panel");
	thisReq.appendChild(tableThisBody);

	//This variable contains all the requirements that belong to the current file
	const thisReqPages = dv
		.pages('"Requirements"')
		.where((req: any) =>
			req.System.includes(
				app.metadataCache.getFileCache(file as TFile)?.frontmatter?.ID
			)
		).values;

	thisReqPages.forEach(async (page: any) => {
		const value = await getEmbedMarkdown({
			path: page.file.path,
			subpath: "Description",
		});

		const tr = document.createElement("tr");
		tr.classList.add("requirement-row");
		tr.innerHTML = `<td colspan="80%">${value}</td><td><a class="internal-link" data-href="${
			page.file.path
		}">${page.file.path.split("/").pop()}</a></td>`;

		tableThisBody.appendChild(tr);

		if (page.Status.toLowerCase() === "conflict") {
			const cPopup = showConflict(tr, [value, "123"]);
			tr.onmouseenter = (ev) => {
				ev.stopPropagation();
				cPopup.style.display = "block";
			};
			tr.addEventListener("mouseout", (ev) => {
				ev.stopPropagation();
				cPopup.style.display = "none";
			});
		}
	});

	container.appendChild(thisReq);

	const addReqModal = document.createElement("div");
	addReqModal.classList.add("add-requirement-modal");
	addReqModal.innerHTML = `
		<span class="modal-bcg"></span>
		<div class="add-requirement-modal-content">
			<span class="requirement-modal-close">&times;</span>
			<h2>Add requirement</h2>
			<div class="add-requirement-modal-input">
				<textarea type="text" id="requirement-description" name="requirement-description" placeholder="Enter requirement description..."></textarea>
				<p style="text-align: end;width:100%; color: rgb(105,105,105);margin-bottom: 20px">Hold <code>Ctrl + Enter</code> to add</p>
			</div>
			
		</div>
	`;

	// container.appendChild(addReqModal);

	container
		.getElementsByClassName("add-requirement-btn")[0]
		?.addEventListener("click", () => {
			console.log("add requirement");
			addReqModal.style.display = "block";
		});

	container
		.getElementsByClassName("requirement-modal-close")[0]
		?.addEventListener("click", () => {
			addReqModal.style.display = "none";
		});

	container.addEventListener(
		"keydown",
		async (event: KeyboardEvent) => {
			if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
				console.log("ctrl + enter pressed");
				event.preventDefault();
				event.stopPropagation();
				const description = document.getElementById(
					"requirement-description"
				) as HTMLInputElement;

				if (!description.value) return;

				await addRequirement({
					description: description.value,
					system: app.metadataCache.getFileCache(file as TFile)
						?.frontmatter?.ID,
					source: "",
				});

				const tr = document.createElement("tr");
				tr.classList.add("requirement-row");
				tr.innerHTML = `<td>${
					description.value
				}</td><td><a class="internal-link" data-href="${
					file.path
				}">${file.path.split("/").pop()}</a></td>`;

				tableThisBody.appendChild(tr);

				description.value = "";
				addReqModal.style.display = "none";
			}
		},
		false
	);

	const toggleBtn = container.getElementsByClassName("accordion");

	for (let i = 0; i < toggleBtn.length; i++) {
		toggleBtn[i].addEventListener("click", function () {
			this.classList.toggle("active");
			const panel = document.getElementsByClassName(
				this.classList[1] + " requirement-panel"
			)[0] as HTMLElement;
			if (!this.classList.contains("active")) {
				panel.style.maxHeight = 0 + "px";
				toggleBtn[i].innerHTML = toggleBtn[i].innerHTML.replace(
					"▼",
					"▶"
				);
			} else {
				panel.style.maxHeight = panel.scrollHeight + "px";
				toggleBtn[i].innerHTML = toggleBtn[i].innerHTML.replace(
					"▶",
					"▼"
				);
			}
		});
	}

	return container;
}

export function showConflict(
	trow: HTMLTableRowElement,
	[req1, req2]: [string, string]
) {
	const container = document.createElement("div");

	const pos = trow.getBoundingClientRect();

	container.classList.add("conflict-popup");
	container.style.position = "fixed";
	container.style.top = "50px";
	container.style.width = `${pos.width}px`;
	container.style.borderRadius = "6px";

	container.innerHTML = `
        <table class="conflict-popup-table">
            <tr style="height:30px;">
                <th colspan="2" style="padding: 5px;">Conflicting requirements, resolve them! ❌</th>
            </tr>
            <tr>
                <td>${req1}</td>
                <td>${req2}</td>
            </tr>
        </table>
    `;

	trow.parentElement?.parentElement?.appendChild(container);
	return container;
}

type VectorType = {
	id: string;
	description: string;
	source: string;
	system: string;
};

export async function compareRequirements(
	res: PineconeRecord<RecordMetadata> | undefined
) {
	// this function will perform a search in a vector database and return a list of requirements that match the search above a certain threshold
	// the threshold is set to 0.7 for now, but can be changed later
	// if there are any conflicts, conflicting requirement should be returned

	if (!res) return;

	const searchResult = await pinecone.index("requirements").query({
		vector: res.values,
		topK: 10,
		includeMetadata: true,
	});

	const potentialConflicts = searchResult.matches
		?.filter(
			(match) =>
				match.score &&
				match.score > 0.9 &&
				match.score < 0.99 &&
				match.metadata?.description !== res.metadata?.description
		)
		.map(
			(match) =>
				"- " +
				match.metadata?.description +
				`\nFile path: ${match.metadata?.path}`
		)
		.join("\n\n");

	if (!potentialConflicts || potentialConflicts === "") {
		console.log("No conflicts found");
		return;
	}

	console.log(potentialConflicts);

	const prompt = `Given requirement:
		${res.metadata?.description}
		
		Requirements to compare to:
		${potentialConflicts}

		---
		Are there any conflicts between the given requirement and the requirements to compare? YES/NO - short reasoning - [[file path]]`;

	const result = await openai.chat.completions.create({
		model: "gpt-4",
		messages: [
			{
				role: "system",
				content: `You are an engineering assistant tasked with comparing a set of requirements and detecting if there are any potential conflicts between them.
					You should only respond in a following format: YES/NO/UNCLEAR - short reasoning - [[file path]]. Remember about the double brackets around the file path.
					Remember to provide reasoning in a short but clear way. If the answer is YES, you should also provide a brief description of a possible ways to resolve the issue.
					If the answer is UNCLEAR provide a short instruction on how the requirement can be improved. If there are multiple conflicts, provide a response only for the one that is conflicting`,
			},
			{
				role: "user",
				content: prompt,
			},
		],
	});

	return result.choices[0].message.content;
}

export async function addEmbed(value: VectorType, file: { path: string }) {
	// this can be adjusted to create a better embedding, adding more context to the input
	const text = `System: 
		${value.system}

		Description:
		${value.description}

		Source:
		${value.source}`;

	const res = (await pinecone.index("requirements").fetch([value.id]))
		.records?.[value.id];

	//compare the res object with the passed value
	//if they are the same, return
	//else, update the embedding
	if (
		res?.metadata?.description === value.description &&
		res.metadata.source === value.source
	) {
		if (res?.metadata?.path !== file.path) {
			await pinecone
				.index("requirements")
				.update({ id: res.id, metadata: { path: file.path } });
			return {
				...res,
				metadata: {
					...res.metadata,
					path: file.path,
				},
			};
		} else {
			return res;
		}
	}

	const embedding = await openai.embeddings.create({
		input: text,
		model: "text-embedding-ada-002",
	});

	await pinecone.index("requirements").upsert([
		{
			id: value.id,
			values: embedding.data[0].embedding,
			metadata: {
				description: value.description,
				source: value.source,
				system: value.system,
				path: file.path,
			},
		},
	]);

	const resAdded = (await pinecone.index("requirements").fetch([value.id]))
		.records?.[value.id];

	return resAdded;
}
