import GameListener from './GameListener';
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {BONUS_CLONE_BALL} from "../../../games/bonusConstants";
import {ACHIEVEMENT_YOU_HAVE_GOT_BALLS} from "../../constants";

export default class YouHaveGotBalls extends GameListener {
	numberBallsOnScreen = 1;

	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
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
		if (this.numberBallsOnScreen === undefined) {
			this.initBonuses();
		}

		this.numberBallsOnScreen *= 2;
		this.updateNumberIfHigher(ACHIEVEMENT_YOU_HAVE_GOT_BALLS, this.numberBallsOnScreen);
	}
}
