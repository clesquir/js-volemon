export default class StreamInitiator {

	constructor(gameInitiator = null) {
		/** @type {GameInitiator} */
		this.gameInitiator = gameInitiator;
	}

	init() {
		var gameInitiator = this.gameInitiator,
			gameId = gameInitiator.gameId;

		GameStream.on('play-' + gameId, function() {
			var player = Players.findOne({gameId: gameId, userId: Meteor.userId()}),
				loopUntilGameContainerIsCreated;

			//Player is in game and this is the current game being started
			if (player) {
				//Wait for gameContainer creation before starting game
				loopUntilGameContainerIsCreated = function() {
					if (document.getElementById('gameContainer')) {
						gameInitiator.createNewGame();
					} else {
						window.setTimeout(loopUntilGameContainerIsCreated, 1);
					}
				};

				loopUntilGameContainerIsCreated();
			}
		});

		GameStream.on('shakeLevelAndResumeOnTimerEnd-' + gameId, function() {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.shakeLevel();
				gameInitiator.currentGame.resumeOnTimerEnd();
			}
		});

		GameStream.on('moveClientBall-' + gameId, function(ballData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.moveClientBall(ballData);
			}
		});

		GameStream.on('moveOppositePlayer-' + gameId, function(isUserHost, playerData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and sent data is for opposite player
			if (
				game && player &&
				((isUserHost && game.createdBy !== Meteor.userId()) || (!isUserHost && game.createdBy === Meteor.userId())) &&
				gameInitiator.hasActiveGame()
			) {
				gameInitiator.currentGame.moveOppositePlayer(playerData);
			}
		});

		GameStream.on('createBonus-' + gameId, function(bonusData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.createBonus(bonusData);
			}
		});

		GameStream.on('activateBonus-' + gameId, function(playerKey) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.activateBonus(playerKey);
			}
		});

		GameStream.on('moveClientBonus-' + gameId, function(bonusData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.moveClientBonus(bonusData);
			}
		});
	}

	stop() {
		var gameId = this.gameInitiator.gameId;

		GameStream.removeAllListeners('play-' + gameId);
		GameStream.removeAllListeners('shakeLevelAndResumeOnTimerEnd-' + gameId);
		GameStream.removeAllListeners('moveClientBall-' + gameId);
		GameStream.removeAllListeners('moveOppositePlayer-' + gameId);
		GameStream.removeAllListeners('createBonus-' + gameId);
		GameStream.removeAllListeners('activateBonus-' + gameId);
		GameStream.removeAllListeners('moveClientBonus-' + gameId);
	}

}
