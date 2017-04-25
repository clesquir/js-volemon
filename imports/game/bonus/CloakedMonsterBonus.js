import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class CloakedMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof CloakedMonsterBonus && bonus.getTargetPlayerKey() === this.getTargetPlayerKey();
	}

	contentToDraw(engine) {
		const bonus = engine.addSprite(0, 0, 'bonus-icons', 1, undefined, true);
		engine.setAnchor(bonus, 0.5);

		return [bonus];
	}

	start() {
		this.game.hideFromOpponent.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.showToOpponent.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}

};
