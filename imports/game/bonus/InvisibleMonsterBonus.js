import InvisibleOpponentMonsterBonus from '/imports/game/bonus/InvisibleOpponentMonsterBonus.js';
import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class InvisibleMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf070';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return (bonus instanceof InvisibleMonsterBonus || bonus instanceof InvisibleOpponentMonsterBonus) &&
			bonus.getTargetPlayerKey() == this.getTargetPlayerKey();
	}

	start() {
		this.game.hidePlayingPlayer.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.showPlayingPlayer.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}

};
