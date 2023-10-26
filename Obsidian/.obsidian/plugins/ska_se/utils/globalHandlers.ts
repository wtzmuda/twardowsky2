import { App } from "obsidian";

interface Plugins {
	dataview: any;
	frontmatter: any;
}

class PluginHandler {
	plugins: Plugins;
	app: App;
	constructor() {}

	init(app: App) {
		this.app = app;
	}

	setPlugins(plugins: Plugins) {
		this.plugins = plugins;
	}

	getPlugins() {
		if (!this.plugins) {
			return {
				//@ts-ignore
				dataview: this.app.plugins.plugins["dataview"].api,
				//@ts-ignore
				frontmatter: this.app.plugins.plugins["metadata-menu"].api,
			};
		}
		return this.plugins;
	}
}

const pluginHandler = new PluginHandler();

export default pluginHandler;
