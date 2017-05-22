import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

Meteor.publish('achievements', function() {
	return Achievements.find();
});

Meteor.publish('userAchievements', function(userId) {
	return UserAchievements.find({userId: userId});
});

Meteor.publish('achievementsRanking', function() {
	const achievementsByUserId = {};

	//Gather profiles
	Profiles.find().forEach((profile) => {
		if (!achievementsByUserId[profile.userId]) {
			achievementsByUserId[profile.userId] = {
				userId: profile.userId,
				level1: 0,
				level2: 0,
				level3: 0
			};
		}
	});

	//Prefetch achievements
	const achievements = Achievements.find();
	const achievementsById = {};
	achievements.forEach(function(achievement) {
		achievementsById[achievement._id] = achievement;
	});

	//Gather achievement count for each level
	UserAchievements.find().forEach((userAchievement) => {
		if (achievementsById[userAchievement.achievementId]) {
			for (let level of achievementsById[userAchievement.achievementId].levels) {
				if (userAchievement.number >= level.number) {
					achievementsByUserId[userAchievement.userId]['level' + level.level] += 1;
				}
			}
		}
	});

	const achievementsRanking = Object.keys(achievementsByUserId).map(userId => achievementsByUserId[userId]);
	achievementsRanking.sort((a, b) => {
		const levelA = a.level1 + a.level2 * 2 + a.level3 * 3;
		const levelB = b.level1 + b.level2 * 2 + b.level3 * 3;

		return levelA > levelB ? -1 : 1;
	});

	achievementsRanking.forEach((achievementRanking) => {
		this.added('achievementsranking', achievementRanking.userId, achievementRanking);
	});

	this.ready();
});
