import {Meteor} from 'meteor/meteor';
import {
	ACHIEVEMENT_GAMES_PLAYED,
	ACHIEVEMENT_SHUTOUTS
} from '/imports/api/achievements/constants.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

Meteor.startup(function () {
	/**
	 * Migration for updating games played and shutouts
	 */
	const profiles = Profiles.find();

	profiles.forEach(function(profile) {
		const userId = profile.userId;

		let userAchievement = UserAchievements.findOne({
			achievementId: ACHIEVEMENT_GAMES_PLAYED,
			userId: userId
		});
		if (userAchievement) {
			UserAchievements.update(
				{
					_id: userAchievement._id,
					userId: userId
				},
				{
					$set: {
						number: profile.numberOfWin + profile.numberOfLost,
						modifiedAt: getUTCTimeStamp()
					}
				}
			);
		}

		userAchievement = UserAchievements.findOne({
			achievementId: ACHIEVEMENT_SHUTOUTS,
			userId: userId
		});
		if (userAchievement) {
			UserAchievements.update(
				{
					_id: userAchievement._id,
					userId: userId
				},
				{
					$set: {
						number: profile.numberOfShutouts,
						modifiedAt: getUTCTimeStamp()
					}
				}
			);
		}
	});
});
