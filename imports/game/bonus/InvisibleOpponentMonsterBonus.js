import InvisibleMonsterBonus from '/imports/game/bonus/InvisibleMonsterBonus.js';
import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class InvisibleOpponentMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf070';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return (bonus instanceof InvisibleOpponentMonsterBonus || bonus instanceof InvisibleMonsterBonus) &&
			bonus.getTargetPlayerKey() == this.getTargetPlayerKey();
	}

	getTargetPlayerKey() {
		return this.activatorPlayerKey == 'player1' ? 'player2' : 'player1';
	}

	getSpriteBorderKeyForList() {
		return 'bonus-target-negative';
	}

	start() {
		this.game.hidePlayingPlayer.call(this.game, this.getTargetPlayerKey());
	}

	stop() {
		this.game.showPlayingPlayer.call(this.game, this.getTargetPlayerKey());

		this.deactivate();
	}

};
