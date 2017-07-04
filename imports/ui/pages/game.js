import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Players} from '/imports/api/games/players.js';
import {
	isGamePlayer,
	isGameStatusStarted,
	isGameStatusOnGoing
} from '/imports/api/games/utils.js';
import {serverNormalizedTime} from '/imports/api/games/client/routeInitiator.js';
import {padNumber} from '/imports/lib/utils.js';

import './game.html';

Template.game.helpers({
	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	},

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

	gameZoomedInClass(profiles) {
		let gameZoomedIn = false;

		profiles.forEach((profile) => {
			if (Meteor.userId() === profile.userId) {
				gameZoomedIn = profile.gameZoomedIn;
			}
		});

		return gameZoomedIn ? 'extra-big-game-size' : '';
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
	}
});

Template.game.events({
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
