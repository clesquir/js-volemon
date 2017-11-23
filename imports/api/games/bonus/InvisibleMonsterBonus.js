import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class InvisibleMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf070';
		this.description = 'Invisible player';
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
