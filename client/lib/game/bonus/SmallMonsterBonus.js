import MonsterScaleBonus from '/client/lib/game/bonus/MonsterScaleBonus.js';

export default class SmallMonsterBonus extends MonsterScaleBonus {

	constructor(game) {
		super(game);
		this.spriteKey = 'bonus-target-negative';
		this.letter = '\uf066';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.SMALL_SCALE_PLAYER_BONUS);
	}

};
