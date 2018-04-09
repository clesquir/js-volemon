import {GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {timeElapsedSince} from '/imports/lib/utils.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

import './gamesList.html';

Template.gamesList.helpers({
	tournamentName: function() {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		return tournament && (tournament.name || tournament.mode.name);
	},

	hasOpponent: function() {
		return (this.clientName !== null);
	},

	hostName: function() {
		let hostName = '-';

		if (this.hostName !== null) {
			hostName = this.hostName;
		}

		return hostName;
	},

	clientName: function() {
		let clientName = '-';

		if (this.clientName !== null) {
			clientName = this.clientName;
		}

		return clientName;
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
