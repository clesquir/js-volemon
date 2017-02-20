import JumpMonsterBonus from '/imports/game/bonus/JumpMonsterBonus.js';

export default class NoJumpMonsterBonus extends JumpMonsterBonus {

	constructor(...args) {
		super(...args);
		this.letter = '\uf13d';
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
