import {
	App,
	Editor,
	HeadingCache,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
} from "obsidian";

import { readFile } from "fs/promises";

import { readFileSync, readdirSync } from "fs";
import { createServer } from "http";
import { statusColor } from "utils/styling";
import {
	addWarning,
	addError,
	removeWarning,
	removeError,
	getSection,
	insertMarkdownUnderHeading,
	addIconToName,
	removeIconFromName,
} from "utils/files";
import {
	addEmbed,
	compareRequirements,
	testsTable,
	requirementsTable2,
	interfacesTable,
} from "utils/requirements";
import pluginHandler from "utils/globalHandlers";
import {
	addComponent,
	addRequirement,
	addToSystemDiagram,
} from "utils/templates";
// Remember to rename these classes and interfaces!

let automaticResolve = false;

interface MyPluginSettings {
	mySetting: string;
	system_design_root_folder: string;
	test_documentation_root_folder: string;
	interfaces_root_folder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	system_design_root_folder: "11-Systems_design",
	test_documentation_root_folder: "05-Test_documentation",
	interfaces_root_folder: "12-Interfaces",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		createServer(async (req, res) => {
			const reqUrl = req.url;
			console.log(reqUrl);

			if (!reqUrl) {
				res.end("No url provided");
				return;
			}

			// disable cors
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers":
					"Origin, X-Requested-With, Content-Type, Accept",
			});
			const file = this.app.vault.getAbstractFileByPath(
				"models/Waddles_wm.stl"
			) as any;
			const uint8View = new Uint8Array(
				await this.app.vault.readBinary(file)
			);
			res.end(uint8View);
			// read a local file
		}).listen(5566);

		pluginHandler.init(this.app);

		this.app.workspace.onLayoutReady(() => {
			console.log(this.app.plugins.plugins);
			pluginHandler.setPlugins({
				//@ts-ignore
				dataview: this.app.plugins.plugins["dataview"].api,
				//@ts-ignore
				frontmatter: this.app.plugins.plugins["metadata-menu"].api,
				//@ts-ignore
				ska_se: this.app.plugins.plugins["ska-se-obsidian-plugin"],
			});
		});
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"SKA SE",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "add-requirements",
			name: "Add requirement",
			callback: async () => {
				const currentFile = this.app.workspace.getActiveFile();

				if (!currentFile) {
					new Notice("Active file is not a component");
					return;
				}

				const system =
					app.metadataCache.getFileCache(currentFile)?.frontmatter
						?.ID;

				if (!system) {
					new Notice("Active file is not a component");
					return;
				}

				const newRequirement = await addRequirement({
					description: "",
					source: "",
					system,
				});

				// open the new file
				app.workspace
					.createLeafBySplit(app.workspace.getLeaf(false))
					.openFile(newRequirement);
			},
		});

		this.addCommand({
			id: "add-component",
			name: "Add component",
			callback: async () => {
				new CreateComponentModal(this.app, this.settings).open();
			},
		});

		this.registerMarkdownCodeBlockProcessor(
			"stlrender",
			async (source, el, ctx) => {
				const frame = document.createElement("iframe");
				frame.id = "stlframe";
				el.appendChild(frame);

				const content = await readFile(
					app.vault.adapter.getBasePath() +
						"/.obsidian/plugins/ska_se/templates/index.html"
				);

				const doc = frame.contentWindow?.document;
				doc?.open();
				doc?.write(content.toString());
				doc?.close();

				frame.style.width = "100%";
				frame.style.minHeight = "400px";
				//@ts-ignore
				const f = document.getElementById("stlframe");
				//@ts-ignore
				f.contentWindow?.addEventListener("load", () => {
					//@ts-ignore
					f.contentWindow?.startRender("/" + source);
				});
			}
		);

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, "click", (evt: MouseEvent) => {
		// 	console.log("click", evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(
		// 	window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		// );

		this.app.workspace.on("file-open", () => {
			const thisFile = this.app.workspace.getActiveFile();
			if (!thisFile) return;

			if (thisFile.extension === "canvas")
				this.app.workspace.onLayoutReady(() =>
					handleCanvas(thisFile, this)
				);
			// system design
			else if (
				thisFile.extension === "md" &&
				thisFile.path.includes(
					this.settings.system_design_root_folder
				) &&
				!thisFile.path.includes("Requirements")
			) {
				console.log("system design");
				this.app.workspace.onLayoutReady(() => {
					handleSystem(thisFile);
				});
				// interfaces
			} else if (
				thisFile.extension === "md" &&
				thisFile.path.includes(this.settings.interfaces_root_folder)
			) {
				console.log("interfaces");
				this.app.workspace.onLayoutReady(() => {
					handleInterface(thisFile);
				});
			} else if (
				thisFile.extension === "md" &&
				thisFile.path.includes("Requirements") &&
				thisFile.basename !== "Requirements"
			) {
				console.log("handling requirement");
				handleRequirement(thisFile, this.app);
			}
		});

		this.app.workspace.on("file-open", async (file) => {
			if (!file) return;
			if (file.extension === "md") {
				//@ts-ignore
				const dv = pluginHandler.getPlugins().dataview;
				const pages = [...dv.pages('"Requirements"')];
				console.log(pages);
				if (!pages) return;
				const pageClass = Object.entries(pages).find(([, page]) => {
					return page.file.path === file.path;
				});

				if (pageClass && pageClass[1].Class.includes("Requirement")) {
					await handleRequirement(file, app);
				}
			}
		});

		const resolvedFiles: (() => Promise<void>)[] = [];

		// this.app.metadataCache.on("resolve", async (file) => {
		// 	if (!file) return;
		// 	if (automaticResolve) {
		// 		automaticResolve = false;
		// 		return;
		// 	}
		// 	if (file.path.includes(".md")) {
		// 		if (file.path.includes("Requirements")) {
		// 			const fileData = this.app.vault
		// 				.getMarkdownFiles()
		// 				.find((f) => f.path === file.path);

		// 			if (!fileData) return;
		// 			if (
		// 				this.app.metadataCache.getFileCache(file)?.frontmatter
		// 					?.Status === "Conflict"
		// 			)
		// 				return;
		// 			resolvedFiles.push(() => handleRequirement(fileData, app));
		// 		}
		// 	}
		// });

		this.app.metadataCache.on("resolved", async () => {
			for (let i = 0; i < resolvedFiles.length; i++) {
				await resolvedFiles[i]();
			}
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

async function handleCanvas(canvasFile: TFile, plugin: MyPlugin) {
	const app = pluginHandler.app;

	const canvasFileRaw = await app.vault.read(canvasFile);
	const canvasJson = JSON.parse(canvasFileRaw);

	if (canvasFile.basename !== "System Diagram") return;

	const nodes = document.getElementsByClassName("canvas-node");

	Array.from(nodes).forEach((node) => {
		resolveComponent(node);
	});

	const edges = canvasJson.edges;

	edges.forEach(
		(
			edge: {
				label: any;
			},
			idx: number
		) => {
			if (!edge.label) {
				canvasJson.edges[idx].label = "⚠️";
			}
		}
	);
	await app.vault.modify(canvasFile, JSON.stringify(canvasJson));

	const usedEdges: any[] = [];
	const newConnections: {
		[key: string]: string[];
	} = {};
	const edgesEls = Array.from(
		document.getElementsByClassName("canvas-path-label")
	);
	edges.forEach((edge: any, idx: number) => resolveEdge(edge, idx));
	await app.vault.modify(canvasFile, JSON.stringify(canvasJson));

	const int = await pluginHandler
		.getPlugins()
		.dataview.pages(`"${plugin.settings.interfaces_root_folder}"`);
	int.forEach(async (i: any) => {
		await pluginHandler
			.getPlugins()
			.frontmatter.postValues(i.file.path, [
				{ name: "Connections", payload: { value: "" } },
			]);
	});

	// update the connections property of each interface
	Object.entries(newConnections).forEach(async ([file, connections]) => {
		const fileCache = app.metadataCache.getCache(file);
		if (
			fileCache &&
			fileCache.frontmatter &&
			fileCache.frontmatter.Connections
		) {
			await pluginHandler.getPlugins().frontmatter.postValues(file, [
				{
					name: "Connections",
					payload: {
						value: connections
							.map((c: string) => `\n - ${c.trim()}`)
							.join(""),
					},
				},
			]);
		}
	});

	async function resolveComponent(node: Element) {
		let isGroup = false;

		if (node.classList.contains("canvas-node-group")) isGroup = true;

		// add class to group to make it clickable
		node.classList.add("canvas-node-subsystem");
		const groupContent = node.childNodes[0]?.childNodes[0];
		const groupLabel = node.childNodes[1];

		const nodeName = isGroup
			? groupLabel?.textContent
			: groupContent?.textContent;

		if (!nodeName) return;

		const nodeFile = app.metadataCache.getFirstLinkpathDest(nodeName, "");

		if (!nodeFile) return;

		if (node.classList.contains("dom-event-registered")) return;
		plugin.registerDomEvent(node as HTMLElement, "dblclick", () => {
			if (nodeFile && nodeFile.extension === "md") {
				app.workspace.openLinkText(nodeFile.path, "", true);
			}
		});

		node.classList.add("dom-event-registered");

		let update = false;

		for (let i = 0; i < canvasJson.nodes.length; i++) {
			if (
				canvasJson.nodes[i].label === nodeName &&
				canvasJson.nodes[i].file !== nodeFile?.path
			) {
				update = true;
				canvasJson.nodes[i].file = nodeFile?.path;
				break;
			}
		}
		update &&
			(await app.vault.modify(canvasFile, JSON.stringify(canvasJson)));

		// update handlers logic
		if (isGroup) {
			plugin.registerDomEvent(groupLabel as HTMLElement, "focusout", () =>
				resolveComponent(node)
			);
		} else {
			plugin.registerDomEvent(
				groupContent as HTMLElement,
				"mouseout",
				() => resolveComponent(node)
			);
		}
	}

	async function resolveEdge(
		edgeJson: {
			label: any;
			childNodes: any;
			fromNode: any;
			toNode: any;
			id: string;
		},
		index: number
	) {
		const edge = Array.from(edgesEls).find((edge) => {
			return (
				edgeJson.label === edge.childNodes[0]?.textContent &&
				!usedEdges.includes(edge)
			);
		});

		if (!edge) return;

		// get the edge from the canvas file

		const edgeName = edge.childNodes[0]?.textContent;

		if (!edgeName || edgeName.length <= 3) {
			canvasJson.edges[index].label = "⚠️";
			return;
		}

		let bestMatch = "";

		Object.entries(app.vault.fileMap).forEach(([path, file]) => {
			if (path.includes(".md")) {
				if (
					file.basename
						.toLowerCase()
						.includes(edgeName?.toLowerCase()) &&
					file.basename.length > bestMatch.length
				) {
					bestMatch = file.basename;
				}
			}
		});

		const edgeFile = edgeName
			? app.metadataCache.getFirstLinkpathDest(bestMatch, "")
			: null;

		if (!edgeFile || edgeFile.extension !== "md") return;

		if (!edge.classList.contains("dom-event-registered")) {
			plugin.registerDomEvent(edge as HTMLElement, "dblclick", () => {
				app.workspace.openLinkText(edgeFile.path, "", true);
			});

			edge.classList.add("dom-event-registered");
		}

		// get the from and to nodes
		const fromNode = canvasJson.nodes.find((node: any) => {
			return node.id === edgeJson.fromNode;
		}).file;
		const toNode = canvasJson.nodes.find((node: any) => {
			return node.id === edgeJson.toNode;
		}).file;

		// get the from and to files
		const fromFile = app.metadataCache.getFirstLinkpathDest(fromNode, "");
		const toFile = app.metadataCache.getFirstLinkpathDest(toNode, "");

		// get the from and to connections
		const fromConenction = app.metadataCache.getFileCache(fromFile as any)
			?.frontmatter?.ID;
		const toConnection = app.metadataCache.getFileCache(toFile as any)
			?.frontmatter?.ID;

		if (edgeFile) {
			// get the edge's file cache
			const edgeFileCache = app.metadataCache.getCache(edgeFile.path);
			if (
				edgeFileCache &&
				edgeFileCache.frontmatter &&
				edgeFileCache.frontmatter.Connections
			) {
				if (!newConnections[edgeFile.path]) {
					newConnections[edgeFile.path] = [];
				}
				newConnections[edgeFile.path].push(
					`${fromConenction} <=> ${toConnection}`
				);
			}
		}

		canvasJson.edges[index].label = edgeFile.basename;
		usedEdges.push(edge);
	}
}

async function handleSystem(file: TFile) {
	if (!file) return;

	const { frontmatter } = pluginHandler.getPlugins();
	const system = app.metadataCache.getFileCache(file)?.frontmatter?.System;
	const alias = app.metadataCache.getFileCache(file)?.frontmatter;
	console.log("alias", alias);

	await frontmatter.postValues(file, [
		{
			name: "ID",
			payload: {
				value:
					system +
					"." +
					(alias
						? alias.toUpperCase().trim()
						: file.basename
								.replace(/[^\w.,\s]/g, "")
								.toUpperCase()
								.trim()
								.replace(/ /g, "_")),
			},
		},
	]);

	let index = 0;

	async function resolveHeadingComponent(r_file: TFile) {
		if (r_file !== file) return;

		console.log("resolving heading component", index);

		switch (index) {
			case 0:
				const rtmk = await requirementsTable2(file);
				await insertMarkdownUnderHeading(file, "Requirements", rtmk);
				break;
			case 1:
				const ttmk = await testsTable(file);
				await insertMarkdownUnderHeading(file, "Tests", ttmk);
				break;

			case 2:
				const itmk = await interfacesTable(file);
				await insertMarkdownUnderHeading(file, "Interfaces", itmk);
				break;

			default:
				break;
		}
		index++;

		if (index > 2)
			app.metadataCache.off("resolve", resolveHeadingComponent);
	}

	app.metadataCache.on("resolve", resolveHeadingComponent);
}

async function handleInterface(file: TFile) {
	const { metadataCache, vault } = app;
	const fm = metadataCache.getFileCache(file)?.frontmatter as unknown as {
		Type: string[] | undefined;
	};

	if (!fm.Type) return;

	if (fm.Type.includes("Electrical")) {
		await addIconToName(file, app, "⚡");
	} else {
		await removeIconFromName(file, app, "⚡");
	}
	if (fm.Type.includes("Mechanical")) {
		await addIconToName(file, app, "🛠️");
	} else {
		await removeIconFromName(file, app, "🛠️");
	}
	if (fm.Type.includes("Software")) {
		await addIconToName(file, app, "💻");
	} else {
		await removeIconFromName(file, app, "💻");
	}
}

async function handleRequirement(file: TFile, app: App) {
	// await addEmbed(content);

	//1st check if the requirement has a source

	const { metadataCache, vault } = app;
	const headings = metadataCache.getFileCache(file)?.headings ?? [];
	let text = await vault.cachedRead(file);

	// app.fileManager.insertTextIntoFile(file, "## test", "", "", false);

	const dIdx = headings.findIndex(
		({ heading }: HeadingCache) => heading === "Description"
	);

	const hIdx = headings.findIndex(
		({ heading }: HeadingCache) => heading === "Source"
	);
	if (hIdx === -1) {
		text = "";
		// set file's name to no source
		await addWarning(file, app);
	} else {
		text = text
			.split("\n")
			.slice(
				headings[hIdx].position.start.line + 1,
				headings[hIdx + 1]?.position?.start?.line
			)
			.join("\n")
			.trim();

		if (text === "") {
			await addWarning(file, app);
		} else {
			await removeWarning(file, app);
		}
	}

	const text2 = await vault.cachedRead(file);
	const values = {
		id: file.basename.replace(/[^\w.,\s]/g, "").trim(),
		description: text2
			.split("\n")
			.slice(
				headings[dIdx].position.start.line + 1,
				headings[dIdx + 1]?.position?.start?.line
			)
			.join("\n")
			.trim(),
		source: text2
			.split("\n")
			.slice(
				headings[hIdx].position.start.line + 1,
				headings[hIdx + 1]?.position?.start?.line
			)
			.join("\n")
			.trim(),
		system:
			metadataCache.getFileCache(file)?.frontmatter?.System ??
			"Unspecified/General",
	};

	addEmbed(values, file).then(async (res) => {
		const data = await file.vault.read(file);
		// remove any conflicts from the file

		const result = await compareRequirements(res);
		const { frontmatter } = pluginHandler.getPlugins();
		console.log(result);
		// Here you can determine what is the output of the comparison algorithm and what to do with it
		if (result?.includes("YES")) {
			const newData = data.replace(
				await getSection(file, "Conflict"),
				""
			);
			await this.app.vault.modify(file, newData);
			await addError(file, this.app);
			// add result to the file
			await app.vault.modify(file, newData + `${result}`);

			frontmatter.postValues(file, [
				{
					name: "Status",
					payload: {
						value: "conflict",
					},
				},
				{
					name: "Conflicting With",
					payload: {
						value: result.substring(
							result.indexOf("[[") + 2,
							result.indexOf("]]")
						),
					},
				},
			]);
		} else {
			await removeError(file, this.app);
			await this.app.vault.modify(
				file,
				data.replace(await getSection(file, "Conflict"), "")
			);

			frontmatter.postValues(file, [
				{
					name: "Status",
					payload: {
						value: "in-review",
					},
				},
				{
					name: "Conflicting With",
					payload: {
						value: "",
					},
				},
			]);
		}
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Get a GPT embedding and compare to other embeddings of the same class in the database
}

class CreateComponentModal extends Modal {
	settings: MyPluginSettings;
	constructor(app: App, settings: MyPluginSettings) {
		super(app);
		this.settings = settings;
	}

	onOpen() {
		const { contentEl } = this;
		const app = this.app;
		const currentFile = this.app.workspace.getActiveFile();
		// input with a prompt for component name
		contentEl.innerHTML = `
		<h2>Create Component</h2>
		<p>Enter component name</p>
		<input type="text" id="component-name" placeholder="Component name" />
		<p>Select if this is a component</p>
		<input type="checkbox" id="is-component" />
		<br>
		<button id="create-component">Create</button>
		`;

		const button = contentEl.querySelector("#create-component");
		const input = contentEl.querySelector(
			"#component-name"
		) as HTMLInputElement;
		const isComponent = contentEl.querySelector(
			"#is-component"
		) as HTMLInputElement;

		const isCanvas = currentFile?.extension === "canvas";

		async function handleCreate() {
			if (!input.value) return;
			const name = input.value;

			if (!currentFile) {
				new Notice("Active file is not a component");
				return;
			}
			let rootPath = currentFile.path.split(currentFile.name)[0];
			if (isCanvas) {
				rootPath = this.settings.system_design_root_folder;
			}

			const newComponent = await addComponent({
				system: "TWR2",
				path: rootPath,
				fileName: name,
			});

			await addToSystemDiagram({
				file: newComponent,
				isComponent: isComponent.checked,
			});

			// open the new file
			app.workspace
				.createLeafBySplit(app.workspace.getLeaf())
				.openFile(newComponent);

			this.close();
		}

		button?.addEventListener("click", handleCreate.bind(this));
		contentEl.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				handleCreate.bind(this)();
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Systems design root folder")
			.setDesc("The folder where the systems design files are stored")
			.addText((text) =>
				text
					.setPlaceholder("Enter the folder path")
					.setValue("11-System_design")
					.onChange(async (value) => {
						this.plugin.settings.system_design_root_folder = value;
						await this.plugin.saveSettings();
					})
			);

		//folder for tests
		new Setting(containerEl)
			.setName("Tests root folder")
			.setDesc("The folder where the tests are stored")
			.addText((text) =>
				text
					.setPlaceholder("Enter the folder path")
					.setValue("05-Test_documentation")
					.onChange(async (value) => {
						this.plugin.settings.test_documentation_root_folder =
							value;
						await this.plugin.saveSettings();
					})
			);

		//folder for interfaces
		new Setting(containerEl)
			.setName("Interfaces root folder")
			.setDesc("The folder where the interfaces are stored")
			.addText((text) =>
				text
					.setPlaceholder("Enter the folder path")
					.setValue("12-Interfaces")
					.onChange(async (value) => {
						this.plugin.settings.interfaces_root_folder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
