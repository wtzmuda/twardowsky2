import { TFile, TFolder, WorkspaceSplit } from "obsidian";
import pluginHandler from "./globalHandlers";
import { readFile } from "fs/promises";

type AddRequirementArgs = {
	description: string;
	source: string;
	system: string;
	id?: string;
};

export async function addRequirement(args: AddRequirementArgs) {
	const app = pluginHandler.app;
	const { ska_se } = pluginHandler.getPlugins();

	const requirementTemplate = await readFile(
		app.vault.adapter.getBasePath() +
			"/.obsidian/plugins/ska_se/templates/requirement.template.md"
	);

	// replace %system% with system's name and %id% with component's id which is system name + component name
	let data = requirementTemplate
		.toString()
		.replace(/%system%/g, args.system)
		.replace(/%description%/g, args.description)
		.replace(/%source%/g, args.source);

	if (!args.id) {
		const num_equirements = app.vault
			.getFiles()
			.filter((file) =>
				file.basename.startsWith(`REQ.${args.system}.`)
			).length;
		args.id = `REQ.${args.system}.${num_equirements + 1}`;
	}

	if (args.id) {
		data = data.replace(/%id%/g, args.id.toUpperCase().replace(/ /g, "_"));
	}

	const rootPath = ska_se.settings.system_design_root_folder;

	return await app.vault.create(
		rootPath + "/Requirements/" + args.id + ".md",
		data
	);
}

export async function addComponent({
	system,
	path,
	id,
}: {
	system: string;
	path: string;
	id?: string;
}) {
	const app = pluginHandler.app;

	const componentTemplate = await readFile(
		app.vault.adapter.getBasePath() +
			"/.obsidian/plugins/ska_se/templates/component.template.md"
	);

	// replace %system% with system's name and %id% with component's id which is system name + component name
	let data = componentTemplate.toString().replace(/%system%/g, system);

	if (id) {
		data = data.replace(/%id%/g, id.toUpperCase().replace(/ /g, "_"));
	}

	return await app.vault.create(path, data);
}

export async function addToSystemDiagram({
	file,
	isComponent,
}: {
	file: TFile;
	isComponent?: boolean;
}) {
	const app = pluginHandler.app;
	const systemDiagram = app.metadataCache.getFirstLinkpathDest(
		"System Diagram",
		""
	);
	if (!systemDiagram) return;
	const d = await app.vault.cachedRead(systemDiagram);
	const dataJson = JSON.parse(d);

	//{"type":"group","id":"96edb452a2e27ff0","file":"Rocket Systems/Propulsion/Propulsion.md","x":-1640,"y":-1860,"width":740,"height":700,"label":"Propulsion"}

	// transform: translate(480.5px, 493.5px) scale(0.802496) translate(-379.033px, 134.171px);
	// get canvas translate as x and y
	const canvasStyle = app.workspace
		.getLeaf()
		.getContainer()
		?.doc.getElementsByClassName("canvas")[0]
		?.getAttribute("style");

	const canvasTranslate = canvasStyle
		?.split("translate(")[2]
		?.split("px)")[0]
		?.split("px, ") ?? [0, 0];

	dataJson.nodes.push({
		type: isComponent ? "text" : "group",
		id: Math.random().toString(36).substring(14),
		file: file.path,
		x: Number(-canvasTranslate[0]) - 150,
		y: Number(-canvasTranslate[1]) - 100,
		width: 300,
		height: 200,
		label: file.basename,
		...(isComponent ? { text: file.basename } : {}),
	});

	await app.vault.modify(systemDiagram, JSON.stringify(dataJson));
}
