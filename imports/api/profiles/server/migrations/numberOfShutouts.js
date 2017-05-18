import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

Meteor.startup(function () {
	/**
	 * Migration for updating profiles.numberOfShutouts
	 */
	const noShutoutsStatsProfiles = Profiles.find({numberOfShutouts: null});

	noShutoutsStatsProfiles.forEach(function(profile) {
		let numberOfShutouts = 0;

		const players = Players.find({userId: profile.userId});
		players.forEach(function(player) {
			const game = Games.findOne({_id: player.gameId});

			if (
				game && (
					(game.createdBy === profile.userId && game.hostPoints === 5 && game.clientPoints === 0) ||
					(game.createdBy !== profile.userId && game.clientPoints === 5 && game.hostPoints === 0)
				)
			) {
				numberOfShutouts++;
			}
		});

		Profiles.update({_id: profile._id}, {$set: {numberOfShutouts: numberOfShutouts}})
	});
});
