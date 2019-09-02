import GameListener from "./GameListener";
import BonusCreated from "../../../games/events/BonusCreated";
import BonusCleared from "../../../games/events/BonusCleared";
import BonusCaught from "../../../games/events/BonusCaught";
import PointTaken from "../../../games/events/PointTaken";
import {ACHIEVEMENT_UNDESIRABLE} from "../../constants";
import {BONUS_NOTHING} from "../../../games/bonusConstants";
import {getArrayMax, getUTCTimeStamp} from "../../../../lib/utils";

export default class Undesirable extends GameListener {
	private bonuses: {[id: string]: number} = {};

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
			this.addBonus(event.data.bonusIdentifier, event.data.createdAt);
		}
	}

	onBonusCleared(event: BonusCleared) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeBonus(event.data.bonusIdentifier);
		}
	}

	onBonusCaught(event: BonusCaught) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeBonus(event.activationData.bonusIdentifier);
		}
	}

	onPointTaken(event: PointTaken) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeAllBonuses();
			this.initBonuses();
		}
	}

	private initBonuses() {
		this.bonuses = {};
	}

	private addBonus(identifier: string, createdAt: number) {
		if (!this.bonuses) {
			this.initBonuses();
		}

		if (this.bonusEnabled(identifier)) {
			this.bonuses[identifier] = createdAt;
		}
	}

	private removeBonus(identifier: string) {
		if (this.bonuses && this.bonuses[identifier]) {
			const elapsed = getUTCTimeStamp() - this.bonuses[identifier];
			delete this.bonuses[identifier];

			this.updateNumberIfHigher(ACHIEVEMENT_UNDESIRABLE, elapsed);
		}
	}

	private removeAllBonuses() {
		if (this.bonuses && Object.keys(this.bonuses).length > 0) {
			const elapsedTimes = [];
			for (let identifier in this.bonuses) {
				if (this.bonuses.hasOwnProperty(identifier)) {
					elapsedTimes.push(getUTCTimeStamp() - this.bonuses[identifier]);
				}
			}

			this.updateNumberIfHigher(ACHIEVEMENT_UNDESIRABLE, getArrayMax(elapsedTimes));
		}
	}

	private bonusEnabled(identifier: string): boolean {
		return (identifier.indexOf(BONUS_NOTHING) === -1);
	}
}
