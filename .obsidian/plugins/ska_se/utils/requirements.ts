import OpenAI from "openai";

import {
	Pinecone,
	PineconeRecord,
	RecordMetadata,
} from "@pinecone-database/pinecone";
import pluginHandler from "./globalHandlers";
import { MarkdownView, TFile, parseLinktext } from "obsidian";
import { addRequirement } from "./templates";
import { insertMarkdownUnderHeading } from "./files";
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

export async function interfacesTable(file: TFile) {
	const { dataview: dv } = pluginHandler.getPlugins();
	const app = pluginHandler.app;

	const render = [];

	const connectionsJson = JSON.parse(
		await app.vault.read(
			app.metadataCache.getFirstLinkpathDest(
				"System Diagram.canvas",
				""
			) as TFile
		)
	);

	// {"id":"98f32aa9cfede9b5","type":"group","file":"Rocket Systems/Recovery/Nosecone Ejection System.md","x":740,"y":-420,"width":260,"height":120,"label":"Nosecone Ejection System"},
	const thisNode = connectionsJson.nodes.find((node: any) =>
		file.path.includes(node.file)
	);

	// {"id":"7743bb435d8311a7","fromNode":"98f32aa9cfede9b5","fromSide":"bottom","toNode":"2c2bfee34c8b5476","toSide":"right","label":"⚠️"},

	const connectingTo = connectionsJson.edges.filter(
		(edge: any) => edge.fromNode === thisNode.id
	);
	const connectingFrom = connectionsJson.edges.filter(
		(edge: any) => edge.toNode === thisNode.id
	);

	const connections = [...connectingTo, ...connectingFrom];

	for (let connection of connections) {
		// get the file that the connection is pointing to and the interface name
		const int = app.metadataCache.getFirstLinkpathDest(
			connection.label,
			""
		) as TFile;

		const node = connectionsJson.nodes.find(
			(node: any) =>
				(connection.fromNode === node.id &&
					connection.toNode === thisNode.id) ||
				(connection.toNode === node.id &&
					connection.fromNode === thisNode.id)
		);

		const nodeFile = app.metadataCache.getFirstLinkpathDest(node.file, "");

		render.push([
			int ? `[[${int.basename}]]` : "None⚠️",
			`[[${nodeFile?.basename}]]`,
		]);
	}

	const tableMarkdown = render.length
		? dv.markdownTable(["Interface Name", "Connecting To"], render)
		: null;
	return tableMarkdown;
}

export async function testsTable(file: TFile) {
	const { dataview: dv, ska_se } = pluginHandler.getPlugins();
	const app = pluginHandler.app;

	const cache = app.metadataCache.getFileCache(file as TFile);

	const tests = dv
		.pages(`"${ska_se.settings.test_documentation_root_folder}"`)
		.where((test: any) => {
			return test.System && test.System.path.includes(file.path);
		}).values;

	if (tests.length === 0) return;

	//modify the tests list. 1. Find position of the header "System Tests". 2. insert the tests list after the header
	const testsSection = cache?.headings?.find(
		(h) => h.heading === "System Tests"
	);
	const testsHeadingIndex = cache?.sections?.findIndex(
		(section) =>
			section.position.start.line === testsSection?.position.start.line
	);

	const listData = dv.markdownList(
		tests.map(
			(test: any) =>
				`[[${test.file.path}|${test.file.name}]] ${
					test.Status === "success" ? "\t✅" : "\t❌"
				}`
		)
	);

	return listData;
}

export async function requirementsTable2(file: TFile) {
	const { dataview: dv, ska_se } = pluginHandler.getPlugins();
	const app = pluginHandler.app;

	const cache = app.metadataCache.getFileCache(file as TFile);

	const thisRequirements = dv
		.pages(`"${ska_se.settings.system_design_root_folder}/Requirements"`)
		.where((req: any) => {
			return req.System && req.System == cache?.frontmatter?.ID;
		}).values;

	if (thisRequirements.length === 0) return "";

	// extract the requirements data from the thisRequirements list

	const tableValues: [string, string][] = [];

	for (const req of thisRequirements) {
		const toReturn: [string, string] = ["", ""];
		toReturn[0] = await getEmbedMarkdown({
			path: req.file.path,
			subpath: "Description",
		});
		toReturn[1] = "[[" + req.file.path.split("/").pop() + "]]";
		tableValues.push(toReturn);
	}

	const tableHeaders = ["Description", "Source"];

	const tableMarkdown =
		"\n" + dv.markdownTable(tableHeaders, tableValues) + "\n";
	return tableMarkdown ?? "";
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
