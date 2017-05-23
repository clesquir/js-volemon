import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_POINT_TIME,
	ACHIEVEMENT_GAME_TIME,
	ACHIEVEMENT_GAMES_PLAYED,
	ACHIEVEMENT_SHUTOUTS
} from '/imports/api/achievements/constants.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {longestGame, longestPoint} from '/imports/api/home/utils.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.startup(function () {
	/**
	 * Migration for initial user achievements insertion
	 */
	if (UserAchievements.find().count() === 0) {
		const profiles = Profiles.find();

		profiles.forEach(function(profile) {
			const userId = profile.userId;

			let achievement = Achievements.findOne({_id: ACHIEVEMENT_POINT_TIME});
			UserAchievements.insert({
				achievementId: achievement._id,
				userId: userId,
				number: longestPoint(userId).duration,
				modifiedAt: getUTCTimeStamp()
			});

			achievement = Achievements.findOne({_id: ACHIEVEMENT_GAME_TIME});
			UserAchievements.insert({
				achievementId: achievement._id,
				userId: userId,
				number: longestGame(userId).duration,
				modifiedAt: getUTCTimeStamp()
			});

			achievement = Achievements.findOne({_id: ACHIEVEMENT_GAMES_PLAYED});
			UserAchievements.insert({
				achievementId: achievement._id,
				userId: userId,
				number: profile.numberOfWin + profile.numberOfLost,
				modifiedAt: getUTCTimeStamp()
			});

			achievement = Achievements.findOne({_id: ACHIEVEMENT_SHUTOUTS});
			UserAchievements.insert({
				achievementId: achievement._id,
				userId: userId,
				number: profile.numberOfShutouts,
				modifiedAt: getUTCTimeStamp()
			});
		});
	}
});
