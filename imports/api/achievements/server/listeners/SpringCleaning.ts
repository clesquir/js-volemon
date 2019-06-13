import GameListener from "./GameListener";
import BonusCleared from "../../../games/events/BonusCleared";
import {ACHIEVEMENT_SPRING_CLEANING} from "../../constants";

export default class SpringCleaning extends GameListener {
	private numberOfCleared: number = 0;
	private lastClearedTime: number = 0;
	private readonly maximumTime: number = 500;

	addListeners() {
		this.addListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
	}

	removeListeners() {
		this.removeListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
	}

	onBonusCleared(event: BonusCleared) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			const currentTime = (new Date()).getTime();
			if (currentTime - this.lastClearedTime > this.maximumTime) {
				this.numberOfCleared = 0;
			}

			this.numberOfCleared++;
			this.updateNumberIfHigher(ACHIEVEMENT_SPRING_CLEANING, this.numberOfCleared);
			this.lastClearedTime = currentTime;
		}
	}
}
