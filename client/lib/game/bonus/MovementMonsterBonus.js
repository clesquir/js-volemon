import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class MovementMonsterBonus extends MonsterBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof MovementMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove);

		this.deactivate();
	}

};
