import InvisibleMonsterBonus from './InvisibleMonsterBonus';
import MonsterBonus from './MonsterBonus';
import {BONUS_INVISIBLE_MONSTER} from '../bonusConstants';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class InvisibleOpponentMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'invisible-opponent-monster';
	description: string = 'Invisible opponent player';

	targetPlayerKey: string;

	classNameToActivate(): string {
		return BONUS_INVISIBLE_MONSTER;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return (
			(bonus instanceof InvisibleOpponentMonsterBonus || bonus instanceof InvisibleMonsterBonus) &&
			bonus.getTargetPlayerKey() === this.getTargetPlayerKey()
		);
	}

	initTargetPlayerKey(bonuses: Bonuses): string {
		if (this.activatorPlayerKey === 'player1') {
			return 'player2';
		} else if (this.activatorPlayerKey === 'player2') {
			return 'player1';
		} else if (this.activatorPlayerKey === 'player3') {
			return 'player4';
		} else if (this.activatorPlayerKey === 'player4') {
			return 'player3';
		} else {
			const player = bonuses.players.getPlayerFromKey(this.activatorPlayerKey);

			if (player.isHost) {
				return 'player2';
			} else {
				return 'player1';
			}
		}
	}

	getTargetPlayerKey(): string {
		return this.targetPlayerKey;
	}

	start(bonuses: Bonuses) {
		this.targetPlayerKey = this.initTargetPlayerKey(bonuses);
		bonuses.hidePlayerFromHimself.call(bonuses, this.getTargetPlayerKey());
	}

	stop(bonuses: Bonuses) {
		bonuses.showPlayerToHimself.call(bonuses, this.getTargetPlayerKey());

		this.deactivate();
	}
};
