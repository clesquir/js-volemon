import {isTournamentAdministrator, isTournamentEditor} from '/imports/api/users/userConfigurations.js';
import {timeDifference, timeElapsedSince} from '/imports/lib/utils.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Mongo} from 'meteor/mongo';
import {ReactiveDict} from 'meteor/reactive-dict';
import {ReactiveVar} from 'meteor/reactive-var';
import {Session} from "meteor/session";
import {Template} from 'meteor/templating';

import './tournaments.html';

class ActiveTournamentsCollection extends Mongo.Collection {}
const ActiveTournaments = new ActiveTournamentsCollection('activeTournaments');

class FutureTournamentsCollection extends Mongo.Collection {}
const FutureTournaments = new FutureTournamentsCollection('futureTournaments');

class SubmittedTournamentsCollection extends Mongo.Collection {}
const SubmittedTournaments = new SubmittedTournamentsCollection('submittedTournaments');

class DraftTournamentsCollection extends Mongo.Collection {}
const DraftTournaments = new DraftTournamentsCollection('draftTournaments');

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
		return !!PastTournaments.find().count() && PastTournamentsState.get('hasMorePastTournaments');
	},

	pastTournaments: function() {
		return PastTournaments.find({}, {sort: [['endDate', 'desc']]});
	},

	showSubmittedTournaments: function() {
		return !!SubmittedTournaments.find().count();
	},

	submittedTournaments: function() {
		return SubmittedTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	showDraftTournaments: function() {
		return !!DraftTournaments.find().count();
	},

	draftTournaments: function() {
		return DraftTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	name: function() {
		if (this.name) {
			return this.name;
		}

		return '';
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return '';
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
	},

	canCreateTournament: function() {
		return isTournamentEditor() || isTournamentAdministrator();
	},

	canOnlyViewTournament: function() {
		return (
			(!isTournamentEditor() && !isTournamentAdministrator()) ||
			(
				isTournamentEditor() &&
				this.editor.id !== Meteor.userId()
			)
		);
	},

	canEditTournament: function() {
		return (
			isTournamentEditor() &&
			this.editor.id === Meteor.userId()
		) ||
		isTournamentAdministrator();
	},

	canRemoveTournament: function() {
		return (
			isTournamentEditor() &&
			this.editor.id === Meteor.userId()
		) ||
		isTournamentAdministrator();
	},

	cannotVote: function() {
		return !Meteor.userId();
	},

	hasVotedUp: function() {
		const userId = Meteor.userId();

		if (this.votes) {
			for (let vote of this.votes) {
				if (vote.userId === userId && vote.vote === 'up') {
					return true;
				}
			}
		}

		return false;
	},

	hasVotedDown: function() {
		const userId = Meteor.userId();

		if (!userId) {
			return false;
		}

		if (this.votes) {
			for (let vote of this.votes) {
				if (vote.userId === userId && vote.vote === 'down') {
					return true;
				}
			}
		}

		return false;
	},

	tournamentVoteScore: function() {
		let score = 0;

		if (this.votes) {
			for (let vote of this.votes) {
				if (vote.vote === 'up') {
					score++;
				} else {
					score--;
				}
			}
		}

		return score;
	}
});

Template.tournaments.events({
	'click [data-action="create-tournament"]': function() {
		Session.set('appLoadingMask', true);
		Session.set('appLoadingMask.text', 'Creating draft tournament...');
		Meteor.call(
			'createTournament',
			function(error, tournament) {
				Session.set('appLoadingMask', false);
				if (error !== undefined) {
					alert(error);
				} else {
					Router.go(Router.routes['tournamentAdministration'].url({tournamentId: tournament}));
				}
			}
		);
	},

	'click [data-action="vote-up-tournament"]': function(e) {
		if (!Meteor.userId()) {
			return false;
		}

		const tournament = $(e.currentTarget).attr('data-tournament-id');

		Meteor.call(
			'voteTournament',
			tournament,
			'up',
			function(error) {
				if (error !== undefined) {
					alert(error);
				}
			}
		);
	},

	'click [data-action="vote-down-tournament"]': function(e) {
		if (!Meteor.userId()) {
			return false;
		}

		const tournament = $(e.currentTarget).attr('data-tournament-id');

		Meteor.call(
			'voteTournament',
			tournament,
			'down',
			function(error) {
				if (error !== undefined) {
					alert(error);
				}
			}
		);
	},

	'click [data-action="view-tournament"]': function(e) {
		Router.go(Router.routes['tournamentAdministration'].url({tournamentId: $(e.currentTarget).attr('data-tournament-id')}));
	},

	'click [data-action="edit-tournament"]': function(e) {
		Router.go(Router.routes['tournamentAdministration'].url({tournamentId: $(e.currentTarget).attr('data-tournament-id')}));
	},

	'click [data-action="remove-tournament"]': function(e) {
		const tournament = $(e.currentTarget).attr('data-tournament-id');

		Meteor.call(
			'removeTournament',
			tournament,
			function(error) {
				if (error !== undefined) {
					alert(error);
				}
			}
		);
	},

	'click [data-action="go-to-tournament"]': function() {
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
		this.uptime.set((new Date()).getTime());
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
	Session.set('pastTournamentsLoadingMask', true);
	Meteor.call(
		'pastTournaments',
		PastTournamentsState.get('currentSkip'),
		PAST_TOURNAMENTS_LIMIT,
		function(error, pastTournaments) {
			Session.set('pastTournamentsLoadingMask', false);
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
