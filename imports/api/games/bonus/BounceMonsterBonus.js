import JumpMonsterBonus from '/imports/api/games/bonus/JumpMonsterBonus.js';

export default class BounceMonsterBonus extends JumpMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'bounce-monster.png';
		this.description = 'Player jumps constantly';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'alwaysJump', true);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', false);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'alwaysJump', false);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', true);

		this.deactivate();
	}
};
