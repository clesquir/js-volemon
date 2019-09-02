import GameListener from './GameListener';
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {BONUS_CLONE_BALL} from "../../../games/bonusConstants";
import {ACHIEVEMENT_YOU_HAVE_GOT_BALLS} from "../../constants";

export default class YouHaveGotBalls extends GameListener {
	numberBallsOnScreen: number = 1;

	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
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
		this.updateNumberIfHigher(ACHIEVEMENT_YOU_HAVE_GOT_BALLS, this.numberBallsOnScreen);
	}
}
