import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';
import {BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants.js';

export default class InvisibleOpponentMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'invisible-opponent-monster';
		this.description = 'Invisible opponent player';
	}

	classNameToActivate() {
		return BONUS_INVISIBLE_MONSTER;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return (
			(bonus instanceof InvisibleOpponentMonsterBonus || bonus instanceof InvisibleMonsterBonus) &&
			bonus.getTargetPlayerKey() === this.getTargetPlayerKey()
		);
	}

	getTargetPlayerKey() {
		if (this.activatorPlayerKey === 'player1') {
			return 'player2';
		} else if (this.activatorPlayerKey === 'player2') {
			return 'player1';
		} else if (this.activatorPlayerKey === 'player3') {
			return 'player4';
		} else if (this.activatorPlayerKey === 'player4') {
			return 'player3';
		}
	}

	start() {
		this.game.hidePlayingPlayer.call(this.game, this.getTargetPlayerKey());
	}

	stop() {
		this.game.showPlayingPlayer.call(this.game, this.getTargetPlayerKey());

		this.deactivate();
	}
};
