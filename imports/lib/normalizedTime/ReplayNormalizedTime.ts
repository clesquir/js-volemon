import NormalizedTime from "./NormalizedTime";
import ReplayReader from "../../api/games/replay/ReplayReader";

export default class ReplayNormalizedTime implements NormalizedTime {
	private readonly replayReader: ReplayReader;

	constructor(replayReader: ReplayReader) {
		this.replayReader = replayReader;
	}

	init() {
	}

	stop() {
	}

	getTime(): number {
		return this.replayReader.currentTime();
	}

	getOffset(): number {
		return 0;
	}
}
