import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Players} from '/imports/api/games/players.js';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';

Meteor.publish('activeTournaments', function() {
	Tournaments.find().forEach((tournament) => {
		if (
			Moment.moment(tournament.startDate, "YYYY-MM-DD Z").diff(new Date()) <= 0 &&
			Moment.moment(tournament.endDate, "YYYY-MM-DD Z").diff(new Date()) >= 0
		) {
			this.added('activeTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('futureTournaments', function() {
	Tournaments.find().forEach((tournament) => {
		if (Moment.moment(tournament.startDate, "YYYY-MM-DD Z").diff(new Date()) > 0) {
			this.added('futureTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('pastTournaments', function() {
	Tournaments.find().forEach((tournament) => {
		if (Moment.moment(tournament.endDate, "YYYY-MM-DD Z").diff(new Date()) < 0) {
			this.added('pastTournaments', tournament._id, tournament);
		}
	});

	this.ready();
});

Meteor.publish('tournament', function(tournamentId) {
	return [
		Tournaments.find({_id: tournamentId})
	];
});

Meteor.publish('tournamentProfiles', function(tournamentId) {
	return [
		TournamentProfiles.find({tournamentId: tournamentId})
	];
});

Meteor.publish('tournamentGames', function(tournamentId) {
	return [
		Games.find(
			{
				isPrivate: 0,
				tournamentId: tournamentId,
				status: {$in: [GAME_STATUS_REGISTRATION, GAME_STATUS_STARTED]}
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {tournamentId: 1, hostName: 1, clientName: 1, createdAt: 1, status: 1}
			}
		)
	];
});

Meteor.publish('tournamentGame', function(tournamentId, gameId) {
	return [
		Tournaments.find({_id: tournamentId}),
		Games.find({_id: gameId}),
		Players.find({gameId: gameId}),
		Profiles.find(),
		TournamentProfiles.find({tournamentId: tournamentId}),
		TournamentEloScores.find({gameId: gameId})
	];
});

Meteor.publish('tournamentRanks', function(tournamentId) {
	return [
		Meteor.users.find({}, {fields: {'profile.name': 1}}),
		TournamentProfiles.find({tournamentId: tournamentId})
	];
});
