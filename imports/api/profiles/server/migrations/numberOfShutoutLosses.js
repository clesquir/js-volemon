import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

Meteor.startup(function () {
	/**
	 * Migration for updating profiles.numberOfShutoutLosses
	 */
	const noShutoutLossesStatsProfiles = Profiles.find({numberOfShutoutLosses: null});

	noShutoutLossesStatsProfiles.forEach(function(profile) {
		let numberOfShutoutLosses = 0;

		const players = Players.find({userId: profile.userId});
		players.forEach(function(player) {
			const game = Games.findOne({_id: player.gameId});

			if (
				game && (
					(game.createdBy === profile.userId && game.hostPoints === 0 && game.clientPoints === 5) ||
					(game.createdBy !== profile.userId && game.clientPoints === 0 && game.hostPoints === 5)
				)
			) {
				numberOfShutoutLosses++;
			}
		});

		Profiles.update({_id: profile._id}, {$set: {numberOfShutoutLosses: numberOfShutoutLosses}})
	});
});
