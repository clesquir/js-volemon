import JumpMonsterBonus from '/imports/api/games/bonus/JumpMonsterBonus.js';

export default class NoJumpMonsterBonus extends JumpMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'no-jump-monster';
		this.description = 'Restricts player to jump';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', false);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'alwaysJump', false);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', true);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'alwaysJump', false);

		this.deactivate();
	}
};
