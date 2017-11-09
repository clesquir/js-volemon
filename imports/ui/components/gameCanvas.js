import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {gameData, serverNormalizedTime} from '/imports/api/games/client/routeInitiator.js';
import {Players} from '/imports/api/games/players.js';
import {
	isGamePlayer,
	isGameStatusStarted
} from '/imports/api/games/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {padNumber} from '/imports/lib/utils.js';

import './gameCanvas.html';

Template.gameCanvas.helpers({
	hostPoints: function() {
		return padNumber(this.game.hostPoints);
	},

	hostName: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: this.game.createdBy});

		if (player) {
			return player.name;
		} else {
			return 'Player 1';
		}
	},

	clientPoints: function() {
		return padNumber(this.game.clientPoints);
	},

	clientName: function() {
		const player = Players.findOne({gameId: Session.get('game'), userId: {$ne: this.game.createdBy}});

		if (player) {
			return player.name;
		} else {
			return 'Player 2';
		}
	},

	matchTimer: function() {
		return Session.get('matchTimer');
	},

	pointTimer: function() {
		return Session.get('pointTimer');
	},

	hasViewer: function() {
		return this.game.viewers > 0;
	},

	viewers: function() {
		return this.game.viewers;
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
	$(e.target).css('cursor', 'inherit');

	mouseHideTimer = Meteor.setTimeout(() => {
		$(e.target).css('cursor', 'none');
	}, 500);
};
