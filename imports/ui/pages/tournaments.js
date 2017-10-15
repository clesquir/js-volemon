import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import * as Moment from 'meteor/momentjs:moment';
import {ReactiveVar} from 'meteor/reactive-var';
import {getUTCTimeStamp, timeElapsedSince, timeDifference} from '/imports/lib/utils.js';

import './tournaments.html';

class ActiveTournamentsCollection extends Mongo.Collection {}
const ActiveTournaments = new ActiveTournamentsCollection('activeTournaments');

class FutureTournamentsCollection extends Mongo.Collection {}
const FutureTournaments = new FutureTournamentsCollection('futureTournaments');

class PastTournamentsCollection extends Mongo.Collection {}
const PastTournaments = new PastTournamentsCollection('pastTournaments');

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

	hasPastTournaments: function() {
		return !!PastTournaments.find().count();
	},

	pastTournaments: function() {
		return PastTournaments.find({}, {sort: [['endDate', 'desc']]});
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return this.mode.description;
	},

	timeLeft: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.endDate, "YYYY-MM-DD Z");
		return timeDifference(date.valueOf(), 'Ends in ');
	},

	timeBefore: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.startDate, "YYYY-MM-DD Z");
		return timeDifference(date.valueOf(), 'Starts in ');
	},

	timeFinished: function() {
		Template.instance().uptime.get();
		const date = Moment.moment(this.endDate, "YYYY-MM-DD Z");
		return 'Ended: ' + timeElapsedSince(date.valueOf());
	}
});

Template.tournaments.events({
	'click [data-action="go-to-tournament"]': function(e) {
		Router.go(Router.routes['tournament'].url({tournamentId: this._id}));
	}
});

Template.tournaments.onCreated(function() {
	this.uptime = new ReactiveVar(0);
	this.uptimeInterval = Meteor.setInterval(() => {
		this.uptime.set(getUTCTimeStamp());
	}, 10000);
});

Template.tournaments.destroyed = function() {
	Meteor.clearInterval(this.uptimeInterval);
};
