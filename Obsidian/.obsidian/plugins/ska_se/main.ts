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

import { readFileSync, readdirSync } from "fs";
import { createServer } from "http";
import { statusColor } from "utils/styling";
import {
	addWarning,
	addError,
	removeWarning,
	removeError,
	getSection,
} from "utils/files";
import {
	addEmbed,
	compareRequirements,
	showConflict,
	requirementsTable,
} from "utils/requirements";
import pluginHandler from "utils/globalHandlers";
// Remember to rename these classes and interfaces!

let automaticResolve = false;

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
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
			pluginHandler.setPlugins({
				//@ts-ignore
				dataview: this.app.plugins.plugins["dataview"].api,
				//@ts-ignore
				frontmatter: this.app.plugins.plugins["metadata-menu"].api,
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

		// This command will create a new note in the /tests folder with a template
		this.addCommand({
			id: "create-testing-sheet",
			name: "Create testing sheet",
			callback: () => {
				if (!this.app.vault.getAbstractFileByPath("tests")) {
					this.app.vault.createFolder("tests");
				}
				// read file from a template
				const file = readFileSync(
					`templates/testing-sheet.md`,
					"utf-8"
				);

				this.app.vault.create(
					`tests/testing-${Date.now()}.md`,
					`${file}`
				);
			},
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});

		this.registerMarkdownCodeBlockProcessor(
			"requirements",
			async (source, el, ctx) => {
				console.log(ctx);
				//@ts-ignore
				const div = document.createElement("div");
				div.id = "requirements";
				el.appendChild(div);
				//@ts-ignore
				el.parentElement.style.setProperty(
					"contain",
					"style",
					"important"
				);
				el.parentElement?.style.setProperty("overflow", "visible");

				div.innerHTML = `<h2>Requirements</h2>`;

				//div.appendChild(table);
				const thisFile = this.app.metadataCache.getFirstLinkpathDest(
					ctx.sourcePath,
					""
				) as TFile;
				div.appendChild(requirementsTable(thisFile));

				// const suggestionsTable = document.createElement("table");
				// suggestionsTable.style.width = "100%";
				// suggestionsTable.style.marginTop = "50px";
				// suggestionsTable.innerHTML = `<tr>
				// 	<td>Sample suggested requirement for the rocket</td>
				// 	<td>Source: <a href="https://www.nasa.gov/pdf/458490main_Requirements.pdf">NASA</a></td>
				// 	<td style="width:30px;background-color:red;cursor:pointer;"> X </td>
				// </tr>`;
				// div.appendChild(suggestionsTable);
			}
		);

		this.registerMarkdownCodeBlockProcessor(
			"stlrender",
			async (source, el, ctx) => {
				const frame = document.createElement("iframe");
				frame.id = "stlframe";
				el.appendChild(frame);

				const file =
					this.app.vault.getAbstractFileByPath("misc/test.html");

				if (!file) return;
				const content = await this.app.vault.read(file as any);

				const doc = frame.contentWindow?.document;
				doc?.open();
				doc?.write(content);
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
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}
					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		this.addCommand({
			id: "add-requirement",
			name: "Add requirement",

			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = readFileSync(`templates/requirement.md`, "utf-8");

				this.app.vault.create(
					`requirements/requirement-${Date.now()}.md`,
					`${file}`
				);
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

		this.app.workspace.on("file-open", async (file) => {
			if (!file) return;
			if (file?.extension === "canvas") {
				const groups =
					document.getElementsByClassName("canvas-node-group");

				Array.from(groups).forEach((group) => {
					// add class to group to make it clickable
					group.classList.add("canvas-node-subsystem");

					if (group.classList.contains("dom-event-registered"))
						return;
					this.registerDomEvent(
						group as HTMLElement,
						"dblclick",
						() => {
							if (!group.childNodes[1]?.textContent) return;
							const file = this.app.vault
								.getFiles()
								.find((file) => {
									return (
										file.basename
											.replace(/[^\w.,\s]/g, "")
											.trim() ===
										group.childNodes[1]?.textContent
									);
								});
							if (
								file &&
								file.extension === "md" &&
								file.basename !== "README"
							) {
								this.app.workspace.openLinkText(
									file.path,
									"",
									true
								);
							}
						}
					);

					group.classList.add("dom-event-registered");

					this.app.vault.read(file).then(async (fileJson) => {
						const json = JSON.parse(fileJson);
						const thisNode = this.app.vault.getFiles().find((f) => {
							return f.path.includes(
								group.childNodes[1]?.textContent + ".md"
							);
						});

						json.edges.forEach((edge: any, i: number) => {
							if (!edge.label) {
								edge["label"] = "⚠️";
							}
						});

						json.nodes[
							json.nodes.findIndex((n: any) => {
								return (
									n.label === group.childNodes[1]?.textContent
								);
							})
						]["file"] = thisNode?.path;
						//@ts-ignore
						this.app.vault.process(file, () =>
							JSON.stringify(json)
						);
					});
				});

				const edges =
					document.getElementsByClassName("canvas-path-label");

				const usedEdges: any[] = [];
				const updatedConnections: any = {};

				const mdm =
					//@ts-ignore
					this.app.plugins.plugins["metadata-menu"].api;

				Array.from(edges).forEach((edge) => {
					// add class to group to make it clickable
					edge.classList.add("canvas-path-label-clickable");

					let interfaceEdge: TFile;

					new Promise((resolve, reject) => {
						if (edge.classList.contains("dom-event-registered"))
							return;
						if (
							!edge.childNodes[0]?.textContent ||
							edge.childNodes[0]?.textContent === "⚠️"
						) {
							return;
						}

						const file = this.app.vault.getFiles().find((file) => {
							return (
								file.basename
									.replace(/[^\w.,\s]/g, "")
									.trim() === edge.childNodes[0]?.textContent
							);
						}) as TFile;

						this.registerDomEvent(
							edge as HTMLElement,
							"dblclick",
							() => {
								if (
									file &&
									file.extension === "md" &&
									file.basename !== "README"
								) {
									this.app.workspace.openLinkText(
										file.path,
										"",
										true
									);
								}
							}
						);

						interfaceEdge = file;

						edge.classList.add("dom-event-registered");
						resolve(true);
					}).then(async () => {
						//for each edge we want to go through the canvas file and see what nodes it connects
						//then we want to set the Connections property of the file of this edge to the list of nodes it connects

						this.app.vault.read(file).then(async (file) => {
							const json = JSON.parse(file);
							const nodes = json.nodes;
							const edgeJson = json.edges.find((e: any) => {
								return (
									edge.childNodes &&
									e.label ===
										edge.childNodes[0]?.textContent &&
									!usedEdges.includes(e.id)
								);
							});

							usedEdges.push(edgeJson.id);

							const fromNode = nodes.find((node: any) => {
								return node.id === edgeJson.fromNode;
							}).file;
							const toNode = nodes.find((node: any) => {
								return node.id === edgeJson.toNode;
							}).file;

							const fromFile = this.app.vault
								.getFiles()
								.find((file) => {
									return file.path === fromNode;
								})?.path;

							const toFile = this.app.vault
								.getFiles()
								.find((file) => {
									return file.path === toNode;
								})?.path;

							const fromConenction = await mdm.getValues(
								fromFile,
								"ID"
							);

							const toConnection = await mdm.getValues(
								toFile,
								"ID"
							);

							updatedConnections[interfaceEdge?.path] = [
								...new Set([
									...(updatedConnections[interfaceEdge?.path]
										? updatedConnections[
												interfaceEdge?.path
										  ]
										: []),
									...[
										`${fromConenction[0].trim()} <=> ${toConnection[0].trim()}`,
									],
								]),
							];

							mdm.postValues(interfaceEdge?.path, [
								{
									name: "Connections",
									payload: {
										value: updatedConnections[
											interfaceEdge?.path
										]
											.map(
												(c: string) =>
													`\n - ${c.trim()}`
											)
											.join(""),
									},
								},
							]);
						});
					});
				});

				setTimeout(() => {
					const nodes = document.getElementsByClassName(
						"canvas-node-container"
					);

					Array.from(nodes)
						.filter((node) => {
							// node has parent that has only one class and has a sibling
							return (
								node.parentElement?.classList.length === 1 &&
								node.nextElementSibling
							);
						})
						.forEach((node) => {
							node.innerHTML = `<p style="margin-left: 17px;">${node.nextElementSibling?.innerHTML}</p>`;
							node.nextElementSibling?.remove();

							this.registerDomEvent(
								node as HTMLElement,
								"dblclick",
								() => {
									if (!node.childNodes[0]?.textContent)
										return;
									const file = this.app.vault
										.getFiles()
										.find((file) => {
											return (
												file.basename
													.replace(/[^\w.,\s]/g, "")
													.trim() ===
												node.childNodes[0]?.textContent
											);
										});
									if (
										file &&
										file.extension === "md" &&
										file.basename !== "README"
									) {
										this.app.workspace.openLinkText(
											file.path,
											"",
											true
										);
									}
								}
							);
						});
				}, 500);
			} else if (file.extension === "md") {
				//@ts-ignore
				const dv = pluginHandler.getPlugins().dataview;
				const pages = [...dv.pages('"Requirements"')];
				if (!pages) return;
				const pageClass = Object.entries(pages).find(([, page]) => {
					return page.file.path === file.path;
				});

				if (pageClass && pageClass[1].Class.includes("Requirement")) {
					await handleRequirement(file, app);
				}
			}
		});

		// console.log all the edges in a canvas file

		this.app.vault.read(this.app.vault.getFiles()[0]).then((file) => {
			// console.log(file);
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
			frontmatter.postValues(file, [
				{
					name: "Status",
					payload: {
						value: "conflict",
					},
				},
				{
					name: "Conflicting-with",
					payload: {
						value: result.substring(
							result.indexOf("[[") + 2,
							result.indexOf("]]")
						),
					},
				},
			]);
			const newData = data.replace(
				await getSection(file, "Conflict"),
				""
			);
			await this.app.vault.modify(file, newData);
			await addError(file, this.app);
			// add result to the file
			await app.vault.modify(file, newData + `${result}`);
		} else {
			await removeError(file, this.app);
			frontmatter.postValues(file, [
				{
					name: "Status",
					payload: {
						value: "in-review",
					},
				},
				{
					name: "Conflicting-with",
					payload: {
						value: "",
					},
				},
			]);
			await this.app.vault.modify(
				file,
				data.replace(await getSection(file, "Conflict"), "")
			);
		}
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Get a GPT embedding and compare to other embeddings of the same class in the database
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
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
	}
}
