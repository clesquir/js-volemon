import GameListener from "./GameListener";
import BonusCleared from "../../../games/events/BonusCleared";
import {ACHIEVEMENT_MISTER_CLEAN} from "../../constants";
import GameFinished from "../../../games/events/GameFinished";

export default class MisterClean extends GameListener {
	private numberOfBonusesCleared: number = 0;

	addListeners() {
		this.addListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
		this.addListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.prototype.constructor.name, this.onGameFinished);
		this.removeListener(BonusCleared.prototype.constructor.name, this.onBonusCleared);
	}

	onBonusCleared(event: BonusCleared) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.numberOfBonusesCleared++;
		}
	}

	onGameFinished(event: GameFinished) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			const userAchievement = this.getUserAchievement(ACHIEVEMENT_MISTER_CLEAN);

			let number = this.numberOfBonusesCleared;
			if (userAchievement) {
				number = userAchievement.number + this.numberOfBonusesCleared;
			}

			this.insertOrUpdateAchievement(userAchievement, ACHIEVEMENT_MISTER_CLEAN, number);
		}
	}
}
