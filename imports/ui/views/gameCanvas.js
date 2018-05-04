import {gameData, serverNormalizedTime} from '/imports/api/games/client/routeInitiator.js';
import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Players} from '/imports/api/games/players.js';
import {isGamePlayer, isGameStatusStarted} from '/imports/api/games/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {onMobileAndTablet, padNumber} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './gameCanvas.html';

Template.gameCanvas.helpers({
	hostPoints: function() {
		return padNumber(this.game.hostPoints);
	},

	hostNames: function() {
		if (this.game.gameMode === TWO_VS_TWO_GAME_MODE) {
			return this.game.players[0].name + ' / ' + this.game.players[2].name;
		} else {
			return this.game.players[0].name;
		}
	},

	clientPoints: function() {
		return padNumber(this.game.clientPoints);
	},

	clientNames: function() {
		if (this.game.gameMode === TWO_VS_TWO_GAME_MODE) {
			return this.game.players[1].name + ' / ' + this.game.players[3].name;
		} else {
			return this.game.players[1].name;
		}
	},

	matchTimer: function() {
		return Session.get('matchTimer');
	},

	pointTimer: function() {
		return Session.get('pointTimer');
	},

	hasViewer: function() {
		return this.game.viewers.length > 0;
	},

	viewers: function() {
		return this.game.viewers.length;
	},

	viewersList: function() {
		const viewersList = [];

		for (let i = 0; i < this.game.viewers.length; i++) {
			viewersList.push(this.game.viewers[i].name);
		}

		return viewersList.join('<br />');
	},

	isGamePlayer: function() {
		return isGamePlayer(Session.get('game'));
	},

	getFinishedStatusClass: function() {
		if (!isGameStatusStarted(this.game.status)) {
			return 'finished-game-status';
		}
	},

	gameZoomedInClass() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		if (userConfiguration && userConfiguration.gameZoomedIn) {
			return 'extra-big-game-size';
		} else {
			return '';
		}
	},

	showAfterGame() {
		return !isGameStatusStarted(this.game.status);
	},

	connectionClass() {
		return Session.get('connection-indicator-class');
	},

	connectionInformation() {
		let webRTCUsage = 'No connection';
		switch (Session.get('connection-indicator-class')) {
			case 'connection-indicator-light-green':
				webRTCUsage = 'WebRTC used';
				break;
			case 'connection-indicator-light-yellow':
				webRTCUsage = 'WebRTC not used';
				break;
			case 'connection-indicator-light-red':
				webRTCUsage = 'WebRTC disabled';
				break;
		}

		let serverOffset = '-';
		if (serverNormalizedTime) {
			serverOffset = serverNormalizedTime.serverOffset + 'ms';
		}

		return webRTCUsage + '<br />' + 'Server offset: ' + serverOffset;
	},

	classForMatchPoint() {
		if (gameData && gameData.isGameStatusStarted()) {
			if (gameData.isDeucePoint()) {
				return 'deuce-point-frame';
			} else if (gameData.isMatchPoint()) {
				return 'match-point-frame';
			}
		}

		return '';
	},

	showMobileController() {
		const player = Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});

		return player && onMobileAndTablet();
	}
});

Template.gameCanvas.events({
	'click [data-action="expand-extra-big-game"]': function() {
		const gameContainer = $('.game-container').first();
		let zoomedIn = false;

		if ($(gameContainer).is('.extra-big-game-size')) {
			$(gameContainer).removeClass('extra-big-game-size');
		} else {
			$(gameContainer).addClass('extra-big-game-size');
			zoomedIn = true;
		}

		if (Meteor.userId()) {
			Meteor.call('saveZoomedInGame', zoomedIn);
		}
	}
});

Template.gameCanvas.rendered = function() {
	$(this.find('.game-container')).on('mousemove', '#gameContainer', mouseMoveShowsCursor);
};

let mouseHideTimer;
const mouseMoveShowsCursor = function(e) {
	Meteor.clearTimeout(mouseHideTimer);
	gameContainer(e).css('cursor', 'inherit');

	mouseHideTimer = Meteor.setTimeout(() => {
		gameContainer(e).css('cursor', 'none');
	}, 500);
};

const gameContainer = function(e) {
	let gameContainer = $(e.target);

	if (!gameContainer.is('#gameContainer')) {
		gameContainer = gameContainer.parent('#gameContainer');
	}

	return gameContainer;
};
