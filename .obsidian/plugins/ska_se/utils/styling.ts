export function statusColor(status: string) {
	switch (status.toLowerCase()) {
		case "conflict":
			return "orange";
		case "tested":
			return "green";
		case "accepted":
			return "green";
		case "in-revision":
			return "blue";
		default:
			return "orange";
	}
}
