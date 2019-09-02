import GameListener from "./GameListener";
import BonusCreated from "../../../games/events/BonusCreated";
import BonusCleared from "../../../games/events/BonusCleared";
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {ACHIEVEMENT_THEY_ARE_ALL_OVER} from "../../constants";

export default class TheyAreAllOver extends GameListener {
	private numberBonusesOnScreen: number = 0;

	addListeners() {
		this.addListener(BonusCreated.getClassName(), this.onBonusCreated);
		this.addListener(BonusCleared.getClassName(), this.onBonusCleared);
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCreated.getClassName(), this.onBonusCreated);
		this.removeListener(BonusCleared.getClassName(), this.onBonusCleared);
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
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
