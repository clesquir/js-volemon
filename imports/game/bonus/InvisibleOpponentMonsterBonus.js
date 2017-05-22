import InvisibleMonsterBonus from '/imports/game/bonus/InvisibleMonsterBonus.js';
import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';
import {BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants.js';

export default class InvisibleOpponentMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf070';
	}

	classNameToActivate() {
		return BONUS_INVISIBLE_MONSTER;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return (bonus instanceof InvisibleOpponentMonsterBonus || bonus instanceof InvisibleMonsterBonus) &&
			bonus.getTargetPlayerKey() === this.getTargetPlayerKey();
	}

	getTargetPlayerKey() {
		return this.activatorPlayerKey === 'player1' ? 'player2' : 'player1';
	}

	start() {
		this.game.hidePlayingPlayer.call(this.game, this.getTargetPlayerKey());
	}

	stop() {
		this.game.showPlayingPlayer.call(this.game, this.getTargetPlayerKey());

		this.deactivate();
	}

};
