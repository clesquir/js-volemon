import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';
import {getRandomFloat} from '/imports/lib/utils.js';

export default class DrunkMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'drunk-monster';
		this.description = 'Randomize player movements (only available in tournament)';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof DrunkMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		const game = this.game;
		game.changePlayerProperty.call(
			game,
			this.activatorPlayerKey,
			'horizontalMoveModifier',
			() => {
				if (Date.now() - (game.lastDrunkMonsterModifier || 0) > 500) {
					game.lastDrunkMonsterModifier = Date.now();
					const backward = getRandomFloat(-0.2, -0.1);
					const forward = getRandomFloat(0.4, 0.7);
					game.drunkMonsterModifier = Random.choice([backward, forward, forward, forward]);
				}
				return game.drunkMonsterModifier;
			}
		);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'horizontalMoveModifier', () => {return 1;});

		this.deactivate();
	}
};
