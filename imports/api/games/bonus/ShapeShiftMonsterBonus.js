import {Random} from 'meteor/random';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class ShapeShiftMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.playerShape = null;
		this.atlasFrame = 'shape-shift-monster';
		this.description = 'Shape shifts player';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ShapeShiftMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	beforeActivation(payload) {
		//Define the player random shape different from the player initial and current one
		let listOfShapes = Array.from(PLAYER_LIST_OF_SHAPES);

		const initialPolygonObjectIndex = listOfShapes.indexOf(this.game.playerInitialShapeFromKey(payload.player));
		if (initialPolygonObjectIndex !== -1) {
			listOfShapes.splice(initialPolygonObjectIndex, 1);
		}

		const currentPolygonObjectIndex = listOfShapes.indexOf(this.game.playerCurrentShapeFromKey(payload.player));
		if (currentPolygonObjectIndex !== -1) {
			listOfShapes.splice(currentPolygonObjectIndex, 1);
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

	activationData() {
		const activationData = super.activationData();

		activationData.playerShape = this.playerShape;

		return activationData;
	}

	start() {
		this.game.shiftPlayerShape.call(this.game, this.activatorPlayerKey, this.playerShape);
	}

	stop() {
		this.game.resetPlayerShape.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}
};
