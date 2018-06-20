import {ONE_VS_COMPUTER_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {timeElapsedSince} from '/imports/lib/utils.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';
import './gamesList.html';

const he = require('he');

Template.gamesList.helpers({
	tournamentName: function() {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		return tournament && (tournament.name || tournament.mode.name);
	},

	hostNames: function() {
		if (this.gameMode === TWO_VS_TWO_GAME_MODE) {
			return he.encode(this.players[0].name) + '<br />' + he.encode(this.players[2].name);
		} else {
			return he.encode(this.players[0].name);
		}
	},

	clientNames: function() {
		if (this.gameMode === TWO_VS_TWO_GAME_MODE) {
			return he.encode(this.players[3].name) + '<br />' + he.encode(this.players[1].name);
		} else if (this.gameMode === ONE_VS_COMPUTER_GAME_MODE) {
			return 'CPU';
		} else {
			return he.encode(this.players[1].name);
		}
	},

	createdAt: function() {
		Template.instance().uptime.get();
		return timeElapsedSince(this.createdAt);
	},

	gameStatus: function() {
		switch (this.status) {
			case GAME_STATUS_REGISTRATION:
				return 'Registration';
			case GAME_STATUS_STARTED:
				return 'Started';
		}

		return '-';
	}
});

Template.gamesList.events({
	'click [data-action="go-to-game"]': function() {
		if (this.tournamentId) {
			Router.go('tournamentGame', {gameId: this._id, tournamentId: this.tournamentId});
		} else {
			Router.go('game', {_id: this._id});
		}
	}
});

Template.gamesList.onCreated(function() {
	this.uptime = new ReactiveVar(0);
	this.uptimeInterval = Meteor.setInterval(() => {
		this.uptime.set((new Date()).getTime());
	}, 10000);
});

Template.gamesList.destroyed = function() {
	Meteor.clearInterval(this.uptimeInterval);
};
