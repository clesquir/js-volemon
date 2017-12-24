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
			'moveModifier',
			() => {
				if (Date.now() - (game.lastDrunkMonsterModifier || 0) > 500) {
					game.lastDrunkMonsterModifier = Date.now();
					const backward = getRandomFloat(-0.25, 0);
					const forward = getRandomFloat(0.25, 0.5);
					game.drunkMonsterModifier = Random.choice([backward, forward, forward, forward]);
				}
				return game.drunkMonsterModifier;
			}
		);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'moveModifier', () => {return 1;});

		this.deactivate();
	}
};
