import {isTwoVersusTwoGameMode} from '/imports/api/games/constants.js';
import CurrentGame from '/imports/api/games/CurrentGame';
import {isDeucePoint, isMatchPoint} from '/imports/api/games/utils';
import {isGamePlayer, isGameStatusStarted} from '/imports/api/games/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import ClientServerOffsetNormalizedTime from '/imports/lib/normalizedTime/ClientServerOffsetNormalizedTime';
import {onMobileAndTablet, padNumber} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import './gameCanvas.html';

const he = require('he');

Template.gameCanvas.helpers({
	hostPoints: function() {
		return padNumber(CurrentGame.getHostPoints());
	},

	hostNames: function() {
		if (isTwoVersusTwoGameMode(this.game.gameMode)) {
			return '<span class="host-player">' + he.encode(this.game.players[0].name) + '</span>' + ' / ' +
				'<span class="host-second-player">' + he.encode(this.game.players[2].name) + '</span>';
		} else {
			return '<span class="host-player">' + he.encode(this.game.players[0].name) + '</span>';
		}
	},

	clientPoints: function() {
		return padNumber(CurrentGame.getClientPoints());
	},

	clientNames: function() {
		if (isTwoVersusTwoGameMode(this.game.gameMode)) {
			return '<span class="client-second-player">' + he.encode(this.game.players[3].name) + '</span>' + ' / ' +
				'<span class="client-player">' + he.encode(this.game.players[1].name) + '</span>';
		} else {
			return '<span class="client-player">' + he.encode(this.game.players[1].name) + '</span>';
		}
	},

	matchTimer: function() {
		return Session.get('matchTimer');
	},

	pointTimer: function() {
		return Session.get('pointTimer');
	},

	hasViewer: function() {
		return !CurrentGame.getIsReplay() && this.game.viewers.length > 0;
	},

	viewers: function() {
		return this.game.viewers.length;
	},

	viewersList: function() {
		const viewersList = [];

		for (let i = 0; i < this.game.viewers.length; i++) {
			viewersList.push(he.encode(this.game.viewers[i].name));
		}

		return viewersList.join('<br />');
	},

	isGamePlayer: function() {
		return !CurrentGame.getIsReplay() && isGamePlayer(Session.get('game'));
	},

	getFinishedStatusClass: function() {
		if (!isGameStatusStarted(CurrentGame.getStatus())) {
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

	showReplayControls() {
		return CurrentGame.getIsReplay();
	},

	showAfterGame() {
		return !isGameStatusStarted(CurrentGame.getStatus());
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

		const serverOffset = ClientServerOffsetNormalizedTime.get().getOffset() + 'ms';

		return webRTCUsage + '<br />' + 'Server offset: ' + serverOffset;
	},

	classForMatchPoint() {
		if (isGameStatusStarted(CurrentGame.getStatus())) {
			if (isDeucePoint(CurrentGame.getHostPoints(), CurrentGame.getClientPoints(), this.game.maximumPoints)) {
				return 'deuce-point-frame';
			} else if (isMatchPoint(CurrentGame.getHostPoints(), CurrentGame.getClientPoints(), this.game.maximumPoints)) {
				return 'match-point-frame';
			}
		}

		return '';
	},

	showMobileController() {
		return Session.get('userCurrentlyPlaying') && onMobileAndTablet();
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

		window.dispatchEvent(new Event('resize'));

		if (Meteor.userId()) {
			Meteor.call('saveZoomedInGame', zoomedIn);
		}
	}
});

Template.gameCanvas.rendered = function() {
	$(this.find('.game-container')).on('mousemove', '#game-container', mouseMoveShowsCursor);
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

	if (!gameContainer.is('#game-container')) {
		gameContainer = gameContainer.parent('#game-container');
	}

	return gameContainer;
};
