import {getUTCTimeStamp, timeDifference, timeElapsedSince} from '/imports/lib/utils.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Mongo} from 'meteor/mongo';
import {ReactiveDict} from 'meteor/reactive-dict';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

import './tournaments.html';

class ActiveTournamentsCollection extends Mongo.Collection {}
const ActiveTournaments = new ActiveTournamentsCollection('activeTournaments');

class FutureTournamentsCollection extends Mongo.Collection {}
const FutureTournaments = new FutureTournamentsCollection('futureTournaments');

const PAST_TOURNAMENTS_LIMIT = 5;
const PAST_TOURNAMENTS_INCREMENT = 5;

class PastTournamentsCollection extends Mongo.Collection {}
const PastTournaments = new PastTournamentsCollection(null);
const PastTournamentsState = new ReactiveDict();

Template.tournaments.helpers({
	hasActiveTournaments: function() {
		return !!ActiveTournaments.find().count();
	},

	activeTournaments: function() {
		return ActiveTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	hasFutureTournaments: function() {
		return !!FutureTournaments.find().count();
	},

	futureTournaments: function() {
		return FutureTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	hasMorePastTournaments: function() {
		return PastTournamentsState.get('hasMorePastTournaments');
	},

	hasPastTournaments: function() {
		return !!PastTournaments.find().count();
	},

	pastTournaments: function() {
		return PastTournaments.find({}, {sort: [['endDate', 'desc']]});
	},

	name: function() {
		if (this.name) {
			return this.name;
		}

		return this.mode.name;
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return this.mode.description;
	},

	timeLeft: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.endDate, "YYYY-MM-DD ZZ");
		return timeDifference(date.valueOf(), 'Ends in ');
	},

	timeBefore: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.startDate, "YYYY-MM-DD ZZ");
		return timeDifference(date.valueOf(), 'Starts in ');
	},

	timeFinished: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.endDate, "YYYY-MM-DD ZZ");
		return 'Ended: ' + timeElapsedSince(date.valueOf());
	}
});

Template.tournaments.events({
	'click [data-action="go-to-tournament"]': function(e) {
		Router.go(Router.routes['tournament'].url({tournamentId: this._id}));
	},

	'click [data-action="show-more-past-tournaments"]': function(e) {
		e.preventDefault();

		PastTournamentsState.set('currentSkip', PastTournamentsState.get('currentSkip') + PAST_TOURNAMENTS_INCREMENT);
		updatePastTournaments();
	}
});

Template.tournaments.onCreated(function() {
	this.uptime = new ReactiveVar(0);
	this.uptimeInterval = Meteor.setInterval(() => {
		this.uptime.set(getUTCTimeStamp());
	}, 10000);

	initPastTournaments();
});

Template.tournaments.destroyed = function() {
	Meteor.clearInterval(this.uptimeInterval);
};

export const initPastTournaments = function() {
	PastTournaments.remove({});
	PastTournamentsState.set('currentSkip', 0);
	PastTournamentsState.set('hasMorePastTournaments', true);

	updatePastTournaments();
};

export const updatePastTournaments = function() {
	Meteor.call(
		'pastTournaments',
		PastTournamentsState.get('currentSkip'),
		PAST_TOURNAMENTS_LIMIT,
		function(error, pastTournaments) {
			if (pastTournaments) {
				for (let tournament of pastTournaments) {
					PastTournaments.insert(tournament);
				}

				if (pastTournaments.length < PAST_TOURNAMENTS_LIMIT) {
					PastTournamentsState.set('hasMorePastTournaments', false);
				}
			}
		}
	);
};
