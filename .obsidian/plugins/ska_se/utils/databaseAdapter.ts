import { JSONPreset } from "lowdb/node";

interface RequirementModel {
	// id is the same as path
	id: string;
	conflicts: {
		id: string;
		value: string;
	}[];
}

const defaultRequirements: RequirementModel[] = [];

export const requirementsDB = JSONPreset(
	"requirements.db.json",
	defaultRequirements
);
