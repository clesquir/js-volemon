import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {INITIAL_ACHIVEMENTS} from '/imports/api/achievements/server/migrations/data/initialAchievements.js';

Meteor.startup(function() {
	/**
	 * Migration for initial achievements insertion
	 */
	INITIAL_ACHIVEMENTS.forEach(function(expectedAchievement) {
		const actualAchievement = Achievements.findOne({_id: expectedAchievement._id});

		if (!actualAchievement) {
			Achievements.insert(expectedAchievement);
		} else {
			const updates = {};

			if (actualAchievement.isSecret !== expectedAchievement.isSecret) {
				updates.isSecret = expectedAchievement.isSecret;
			}
			if (actualAchievement.name !== expectedAchievement.name) {
				updates.name = expectedAchievement.name;
			}
			if (actualAchievement.description !== expectedAchievement.description) {
				updates.description = expectedAchievement.description;
			}
			if (actualAchievement.type !== expectedAchievement.type) {
				updates.type = expectedAchievement.type;
			}
			if (actualAchievement.displayOrder !== expectedAchievement.displayOrder) {
				updates.displayOrder = expectedAchievement.displayOrder;
			}
			if (actualAchievement.conditionalForTournamentGame !== expectedAchievement.conditionalForTournamentGame) {
				updates.conditionalForTournamentGame = expectedAchievement.conditionalForTournamentGame;
			}
			if (actualAchievement.deniedForTwoVersusTwo !== expectedAchievement.deniedForTwoVersusTwo) {
				updates.deniedForTwoVersusTwo = expectedAchievement.deniedForTwoVersusTwo;
			}
			if (
				actualAchievement.levels[0].number !== expectedAchievement.levels[0].number ||
				actualAchievement.levels[1].number !== expectedAchievement.levels[1].number ||
				actualAchievement.levels[2].number !== expectedAchievement.levels[2].number
			) {
				updates.levels = expectedAchievement.levels;
			}

			if (Object.keys(updates).length) {
				Achievements.update({_id: actualAchievement._id}, {$set: updates});
			}
		}
	});
});
