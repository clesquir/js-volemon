import GameListener from "./GameListener";
import BonusCreated from "../../../games/events/BonusCreated";
import BonusCleared from "../../../games/events/BonusCleared";
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {ACHIEVEMENT_THEY_ARE_ALL_OVER} from "../../constants";

export default class TheyAreAllOver extends GameListener {
	private numberBonusesOnScreen: number = 0;

	addListeners() {
		this.addListener(BonusCreated.prototype.constructor.name, this.onBonusCreated);
		this.addListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCreated.prototype.constructor.name, this.onBonusCreated);
		this.removeListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	onBonusCreated(event: BonusCreated) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.addBonus();
		}
	}

	onBonusCleared(event: BonusCleared) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeBonus();
		}
	}

	onBonusCaught(event: BonusCaught) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeBonus();
		}
	}

	onPointTaken(event: PointTaken) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.initBonuses();
		}
	}

	private initBonuses() {
		this.numberBonusesOnScreen = 0;
	}

	private addBonus() {
		this.numberBonusesOnScreen++;
		this.updateNumberIfHigher(ACHIEVEMENT_THEY_ARE_ALL_OVER, this.numberBonusesOnScreen);
	}

	private removeBonus() {
		if (this.numberBonusesOnScreen > 0) {
			this.numberBonusesOnScreen--;
		}
	}
}
