import MonsterScaleBonus from '/client/lib/game/bonus/MonsterScaleBonus.js';

export default class SmallMonsterBonus extends MonsterScaleBonus {

	constructor(game) {
		super(game);
		this.letter = 'S';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.SMALL_SCALE_BONUS);
	}

};
