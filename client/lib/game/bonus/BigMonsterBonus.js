import MonsterScaleBonus from '/client/lib/game/bonus/MonsterScaleBonus.js';

export default class BigMonsterBonus extends MonsterScaleBonus {

	constructor(game) {
		super(game);
		this.letter = 'B';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.BIG_SCALE_BONUS);
	}

};