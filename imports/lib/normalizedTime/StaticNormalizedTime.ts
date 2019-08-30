import NormalizedTime from "./NormalizedTime";

export default class StaticNormalizedTime implements NormalizedTime {
	init() {
	}

	stop() {
	}

	getTime(): number {
		return 0;
	}

	getOffset(): number {
		return 0;
	}
}
