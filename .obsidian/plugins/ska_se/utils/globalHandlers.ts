import { App } from "obsidian";

interface Plugins {
	dataview: any;
	frontmatter: any;
	ska_se: {
		settings: {
			mySetting: string;
			system_design_root_folder: string;
			test_documentation_root_folder: string;
			interfaces_root_folder: string;
		};
	};
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
				ska_se: this.app.plugins.plugins["ska-se-obsidian-plugin"] //@ts-ignore
					.api as Plugins["ska_se"],
			};
		}
		return this.plugins;
	}
}

const pluginHandler = new PluginHandler();

export default pluginHandler;
