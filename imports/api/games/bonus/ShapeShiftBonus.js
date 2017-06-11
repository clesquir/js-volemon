import {Random} from 'meteor/random';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class ShapeShiftBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.bonusIconsIndex = 3;
		this.playerShape = null;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ShapeShiftBonus && playerKey === this.activatorPlayerKey;
	}

	beforeActivation(playerKey, activatedAt) {
		//Define the player random shape different from the player initial one
		let listOfShapes = Array.from(PLAYER_LIST_OF_SHAPES);
		const initialPolygonObjectIndex = listOfShapes.indexOf(this.game.playerInitialPolygonObjectFromKey(playerKey));
		listOfShapes.splice(initialPolygonObjectIndex, 1);
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
