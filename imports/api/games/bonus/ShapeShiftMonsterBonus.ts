import {BonusActivationData} from './data/BonusActivationData';
import MonsterBonus from './MonsterBonus';
import {Random} from 'meteor/random';
import Bonuses from "../client/components/Bonuses";
import BaseBonus from "./BaseBonus";

export default class ShapeShiftMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'shape-shift-monster';
	description: string = 'Shape shifts player';

	playerShape: string = null;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ShapeShiftMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	beforeActivation(bonuses: Bonuses, payload) {
		//Define the player random shape different from the player initial and current one
		let listOfShapes = Array.from(bonuses.gameConfiguration.listOfShapes());
		const player = bonuses.players.getPlayerFromKey(payload.player);

		//Remove initial player shape (if not only shape available)
		const initialShapeIndex = listOfShapes.indexOf(player.initialShape);
		if (listOfShapes.length > 1 && initialShapeIndex !== -1) {
			listOfShapes.splice(initialShapeIndex, 1);
		}

		//Remove current player shape (if not last shape available)
		const currentShapeIndex = listOfShapes.indexOf(player.currentShape);
		if (listOfShapes.length > 1 && currentShapeIndex !== -1) {
			listOfShapes.splice(currentShapeIndex, 1);
		}

		this.playerShape = Random.choice(listOfShapes);
	}

	beforeActivationData() {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.playerShape = this.playerShape;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData) {
		this.playerShape = beforeActivationData.playerShape;
	}

	activationData(): BonusActivationData {
		const activationData = super.activationData();

		activationData.playerShape = this.playerShape;

		return activationData;
	}

	start(bonuses: Bonuses) {
		bonuses.shiftPlayerShape.call(bonuses, this.activatorPlayerKey, this.playerShape);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetPlayerShape.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
