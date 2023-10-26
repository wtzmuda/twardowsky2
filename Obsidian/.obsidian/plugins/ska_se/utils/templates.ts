import { TFolder } from "obsidian";
import pluginHandler from "./globalHandlers";

type AddRequirementArgs = {
	description: string;
	source: string;
	system: string;
	id?: string;
};

export async function addRequirement(args: AddRequirementArgs) {
	const app = pluginHandler.app;

	if (!args.id) {
		const reqNum =
			app.vault
				.getMarkdownFiles()
				.filter((file) => file.path.startsWith("Requirements/"))
				.length + 1;

		args.id = `REQ.${args.system}.${reqNum}`;
	}

	const data = `---
Title: ${args.id}
Status: draft
System: ${args.system}
Class: Requirement
---
## Description
${args.description}

## Source	
${args.source}`;

	await app.vault.create("Requirements/" + args.id + ".md", data);
}
