import {EloScores} from "../eloscores";
import {Games} from "../games";
import {Players} from "../players";
import {Replays} from "../replays";
import {GAME_STATUS_STARTED} from "../statusConstants";
import {TeamEloScores} from "../teameloscores";
import {Tournaments} from "../../tournaments/tournaments";
import {Meteor} from 'meteor/meteor';

Meteor.publish('games', function() {
	return [
		Games.find(
			{
				isPrivate: false,
				status: GAME_STATUS_STARTED
			},
			{
				sort: [['createdAt', 'asc']],
				fields: {tournamentId: 1, gameMode: 1, players: 1, createdAt: 1, status: 1}
			}
		),
		Tournaments.find()
	];
});

Meteor.publish('game', function(id) {
	return [
		Games.find({_id: id}),
		Players.find({gameId: id}),
		EloScores.find({gameId: id}),
		TeamEloScores.find({gameId: id})
	];
});

Meteor.publish('gameReplay', function(id) {
	return [
		Replays.find({gameId: id}),
	];
});

Meteor.publish('matchMakingKeepAlive', function() {
	this.ready();

	this.onStop(() => {
		Meteor.call(
			'cancelMatchMaking',
			this.userId
		);
	});
});
