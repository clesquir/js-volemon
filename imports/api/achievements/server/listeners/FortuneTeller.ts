import GameListener from './GameListener';
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {BONUS_CLONE_BALL} from "../../../games/bonusConstants";
import {ACHIEVEMENT_FORTUNE_TELLER} from "../../constants";

export default class FortuneTeller extends GameListener {
	numberBallsOnScreen: number = 1;

	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	onBonusCaught(event: BonusCaught) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer() &&
			event.activatedBonusClass === BONUS_CLONE_BALL
		) {
			this.cloneBall();
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
		this.numberBallsOnScreen = 1;
	}

	private cloneBall() {
		this.numberBallsOnScreen *= 2;

		if (this.numberBallsOnScreen === 8) {
			this.incrementNumber(ACHIEVEMENT_FORTUNE_TELLER);
		}
	}
}
