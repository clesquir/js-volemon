import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class InvincibleMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'invincible-monster';
		this.description = 'Prevents being killed by instant death, poison and ball touching the ground';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InvincibleMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'isInvincible', true);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'isInvincible', false);

		this.deactivate();
	}
};
