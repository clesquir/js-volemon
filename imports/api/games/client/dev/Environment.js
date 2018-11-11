import Dev from '/imports/api/games/client/dev/Dev.js';
import {Random} from 'meteor/random';

export default class Environment extends Dev {
	createPlayersComponents() {
		this.game.player1 = this.game.createHostPlayer('player1', '#a73030');
		this.game.player2 = this.game.createHostPlayer('player2', '#274b7a');
	}

	overrideGame() {
		super.overrideGame();
		this.game.groundHitEnabled = true;
	}

	hitGround(ball) {
		if (this.game.groundHitEnabled && this.game.gameResumed === true) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			this.resumeOnTimerEnd();
		}
	}

	createLevelComponents() {
		this.game.levelComponents.groundGroup = this.game.engine.addGroup(false);
		this.game.levelComponents.createGround();
		const ground = this.game.levelComponents.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, ground);
		this.game.addPlayerCanJumpOnBody(this.game.player2, ground);
	}

	randomlyMoveOpponent() {
		const minX = 300;
		const maxX = 750;
		let x = Math.floor(Math.random() * (maxX - minX)) + minX;
		const minY = 300;
		const maxY = 465;
		let y = Math.floor(Math.random() * (maxY - minY)) + minY;

		this.game.moveClientPlayer({
			key: 'player2',
			x: x,
			y: y,
			velocityX: (this.game.player2.x > x ? -100 : 100),
			velocityY: (this.game.player2.y > y ? -100 : 100),
			timestamp: this.serverNormalizedTime.getServerTimestamp()
		});
	}

	enableOpponentMoveEnabled() {
		const delay = 2500;

		Meteor.clearInterval(this.movingInterval);
		this.movingInterval = Meteor.setInterval(() => {
			this.randomlyMoveOpponent();
		}, delay);
	}

	disableOpponentMoveEnabled() {
		Meteor.clearInterval(this.movingInterval);
	}

	killPlayer() {
		this.gameBonus.killPlayer('player1');
	}

	createRandomBonus() {
		this.gameBonus.createRandomBonus();
	}

	enableGroundHit() {
		this.game.groundHitEnabled = true;
	}

	disableGroundHit() {
		this.game.groundHitEnabled = false;
	}

	enablePlayerCanJumpOnPlayer() {
		this.game.addPlayerCanJumpOnBody(this.game.player1, this.game.player2.body);
	}

	disablePlayerCanJumpOnPlayer() {
		this.game.removePlayerCanJumpOnBody(this.game.player1, this.game.player2.body);
	}
}
