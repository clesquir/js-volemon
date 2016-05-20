/**
 * @type {Volemon}
 */
currentGame = null;

Template.game.helpers({
	isHost: function() {
		return this.game.createdBy === Meteor.userId();
	},

	isPlaying: function() {
		return isGameStatusOnGoing(this.game.status);
	},

	isUserNotPlaying: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return (!player);
	},

	hostPoints: function() {
		return padPoints(this.game.hostPoints);
	},

	hostName: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: this.game.createdBy});

		if (player) {
			return player.name;
		} else {
			return 'Player 1';
		}
	},

	clientPoints: function() {
		return padPoints(this.game.clientPoints);
	},

	clientName: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: {$ne: this.game.createdBy}});

		if (player) {
			return player.name;
		} else {
			return 'Player 2';
		}
	},

	loggedPlayer: function() {
		return Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
	},

	opponents: function() {
		return Players.find({gameId: Session.get('game'), userId: {$ne: Meteor.userId()}});
	},

	canLeave: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return (player && this.game.createdBy !== player.userId);
	},

	canJoin: function() {
		var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()}),
			players = Players.find({gameId: Session.get('game')});

		return (!player && Config.possibleNoPlayers.indexOf(players.count() + 1) !== -1);
	},

	canStart: function() {
		var players = Players.find({gameId: Session.get('game')});

		return (
			this.game.createdBy === Meteor.userId() &&
			Config.possibleNoPlayers.indexOf(players.count()) !== -1
		);
	},

	isPrivateGame: function() {
		return this.game.isPrivate ? true : false;
	}
});

Template.game.events({
	'click [data-action="copy-url"]': function(e) {
		var url = Router.routes['game'].url({_id: Session.get('game')}),
			temporaryInput = $('<input>');

		$('body').append(temporaryInput);
		temporaryInput.val(url).select();
		document.execCommand('copy');
		temporaryInput.remove();

		$(e.target).attr('data-tooltip', 'Copied!');
		$(e.target).trigger('mouseover');

		$(e.target).mouseout(function() {
			$(e.target).attr('data-tooltip', 'Copy to clipboard');
		});
	},

	'click [data-action="update-privacy"]': function(e) {
		var game = Games.findOne(Session.get('game')),
			isPrivate = !game.isPrivate;

		switchTargetButton(e, isPrivate);

		Meteor.call('updateGamePrivacy', Session.get('game'), isPrivate ? 1 : 0);
	},
	
	'click [data-action="start"]': function(e) {
		Meteor.call('startGame', Session.get('game'));
	},

	'click [data-action="join"]': function(e) {
		actionAfterLoginCreateUser = function() {
			Meteor.call('joinGame', Session.get('game'), function(error) {
				if (error) {
					alert(error)
				}
			});
		};

		if (!Meteor.userId()) {
			actionOnLighboxClose = function() {
				actionAfterLoginCreateUser = null;
			};

			return Session.set('lightbox', 'login');
		}

		actionAfterLoginCreateUser();
		actionAfterLoginCreateUser = null;
	},

	'click [data-action="leave"]': function(e) {
		Meteor.call('leaveGame', Session.get('game'));
	}
});

Template.game.rendered = function() {
	var player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()}),
		game = Games.findOne(Session.get('game'));

	//Player is in game and this game is already started
	if (player && isGameStatusOnGoing(game.status)) {
		currentGame = new Volemon();
		currentGame.start();
	}

	keepAliveRegistrationFunction = Meteor.setInterval(function() {
		var game = Games.findOne(Session.get('game')),
			player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		if (game && player && game.status === Constants.GAME_STATUS_REGISTRATION) {
			Meteor.call('keepPlayerAlive', player._id, function(error) {
				if (error && error.error === 404) {
					Meteor.clearInterval(keepAliveRegistrationFunction);
				}
			});
		} else {
			Meteor.clearInterval(keepAliveRegistrationFunction);
		}
	}, Config.keepAliveInterval);
};

Template.game.destroyed = function() {
	if (currentGame) {
		currentGame.stop();
		currentGame = null;
	}
};

GameStream.on('play', function(gameId) {
	var player = Players.findOne({gameId: gameId, userId: Meteor.userId()}),
		loopUntilGameContainerIsCreated;

	//Player is in game and this is the current game being started
	if (player && gameId == Session.get('game')) {
		//Wait for gameContainer creation before starting game
		loopUntilGameContainerIsCreated = function() {
			if (document.getElementById('gameContainer')) {
				currentGame = new Volemon();
				currentGame.start();
			} else {
				window.setTimeout(loopUntilGameContainerIsCreated, 1);
			}
		};

		loopUntilGameContainerIsCreated();
	}
});

GameStream.on('shakeLevelAndResumeOnTimerEnd', function(gameId) {
	var game = Games.findOne(gameId),
		player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

	//Player is in game and is not the creator
	if (game && player && game.createdBy !== Meteor.userId() && currentGame) {
		currentGame.shakeLevel();
		currentGame.resumeOnTimerEnd();
	}
});

GameStream.on('moveClientBall', function(gameId, ballData) {
	var game = Games.findOne(gameId),
		player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

	//Player is in game and is not the creator
	if (game && player && game.createdBy !== Meteor.userId() && currentGame) {
		currentGame.moveClientBall(ballData);
	}
});

GameStream.on('moveOppositePlayer', function(gameId, isUserHost, playerData) {
	var game = Games.findOne(gameId),
		player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

	//Player is in game and sent data is for opposite player
	if (
		game && player &&
		((isUserHost && game.createdBy !== Meteor.userId()) || (!isUserHost && game.createdBy === Meteor.userId())) &&
		currentGame
	) {
		currentGame.moveOppositePlayer(playerData);
	}
});
