import InvisibleMonsterBonus from './InvisibleMonsterBonus';
import MonsterBonus from './MonsterBonus';
import {BONUS_INVISIBLE_MONSTER} from '../bonusConstants';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";
import {BonusPayloadData} from "./data/BonusPayloadData";
import {BonusBeforeActivationData} from "./data/BonusBeforeActivationData";
import {BonusActivationData} from "./data/BonusActivationData";

export default class InvisibleOpponentMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'invisible-opponent-monster';
	description: string = 'Invisible opponent player';

	targetPlayerKey: string = '';

	classNameToActivate(): string {
		return BONUS_INVISIBLE_MONSTER;
	}

	getIndicatorAtlasFrame(): string {
		return 'invisible-monster';
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return (
			(bonus instanceof InvisibleOpponentMonsterBonus || bonus instanceof InvisibleMonsterBonus) &&
			bonus.getTargetPlayerKey() === this.getTargetPlayerKey()
		);
	}

	beforeActivation(bonuses: Bonuses, payload: BonusPayloadData) {
		const player = bonuses.players.getPlayerFromKey(payload.player);
		let opponentKeys = [];

		if (player && !player.isHost) {
			opponentKeys = bonuses.players.hostPlayerKeys();
		} else if (player && player.isHost) {
			opponentKeys = bonuses.players.clientPlayerKeys();
		}

		const possibleTargetPlayers = [];
		for (let opponentKey of opponentKeys) {
			const opponent = bonuses.players.getPlayerFromKey(opponentKey);

			if (!opponent.killed) {
				possibleTargetPlayers.push(opponentKey);
			}
		}

		if (possibleTargetPlayers.length) {
			this.targetPlayerKey = Random.choice(possibleTargetPlayers);
		}
	}

	beforeActivationData(): BonusBeforeActivationData {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.targetPlayerKey = this.targetPlayerKey;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData: BonusBeforeActivationData) {
		this.targetPlayerKey = beforeActivationData.targetPlayerKey;
	}

	activationData(): BonusActivationData {
		const activationData = super.activationData();

		activationData.targetPlayerKey = this.targetPlayerKey;

		return activationData;
	}

	getTargetPlayerKey(): string {
		return this.targetPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.hidePlayerFromHimself.call(bonuses, this.getTargetPlayerKey());
	}

	stop(bonuses: Bonuses) {
		bonuses.showPlayerToHimself.call(bonuses, this.getTargetPlayerKey());

		this.deactivate();
	}
};
