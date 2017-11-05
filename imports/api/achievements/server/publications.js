import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

Meteor.publish('achievements', function() {
	return Achievements.find();
});

Meteor.publish('userAchievements', function(userId) {
	return UserAchievements.find({userId: userId});
});

Meteor.publish('achievementsRanking', function() {
	let achievementsByUserId = {};
	let usernameByUserId = {};

	UserConfigurations.find().forEach((userConfiguration) => {
		usernameByUserId[userConfiguration.userId] = userConfiguration.name;
		achievementsByUserId = initializeAchievementsByUserId(achievementsByUserId, usernameByUserId, userConfiguration.userId);
	});

	//Prefetch achievements
	const achievements = Achievements.find();
	const achievementsById = {};
	achievements.forEach(function(achievement) {
		achievementsById[achievement._id] = achievement;
	});

	for (let userId in achievementsByUserId) {
		if (achievementsByUserId.hasOwnProperty(userId)) {
			this.added('achievementsranking', userId, achievementsByUserId[userId]);
		}
	}

	this.userAchievementsTracker = UserAchievements.find().observe({
		added: (userAchievement) => {
			const userId = userAchievement.userId;

			let useChanged = true;
			if (achievementsByUserId[userId] === undefined) {
				useChanged = false;
			}

			achievementsByUserId = updateAchievementsByUserId(
				achievementsByUserId,
				achievementsById,
				usernameByUserId,
				userId,
				userAchievement.achievementId,
				userAchievement.number,
				0
			);

			if (useChanged) {
				this.changed('achievementsranking', userId, achievementsByUserId[userId]);
			} else {
				this.added('achievementsranking', userId, achievementsByUserId[userId]);
			}
		},
		changed: (userAchievement, oldUserAchievement) => {
			if (userAchievement.number !== oldUserAchievement.number) {
				const userId = userAchievement.userId;
				achievementsByUserId = updateAchievementsByUserId(
					achievementsByUserId,
					achievementsById,
					usernameByUserId,
					userId,
					userAchievement.achievementId,
					userAchievement.number,
					oldUserAchievement.number
				);
				this.changed('achievementsranking', userId, achievementsByUserId[userId]);
			}
		}
	});

	this.userConfigurationsTracker = UserConfigurations.find().observe({
		added: (userConfiguration) => {
			const userId = userConfiguration.userId;
			usernameByUserId[userId] = userConfiguration.name;
			achievementsByUserId = initializeAchievementsByUserId(achievementsByUserId, usernameByUserId, userId);
			this.added('achievementsranking', userId, achievementsByUserId[userId]);
		},
		changed: (userConfiguration, oldUserConfiguration) => {
			if (userConfiguration.name !== oldUserConfiguration.name) {
				const userId = userConfiguration.userId;

				if (achievementsByUserId[userId]) {
					achievementsByUserId[userId].username = userConfiguration.name;
					this.changed('achievementsranking', userId, achievementsByUserId[userId]);
				}
			}
		}
	});

	this.ready();

	this.onStop(() => {
		this.userConfigurationsTracker.stop();
		this.userAchievementsTracker.stop();
	});
});

const initializeAchievementsByUserId = function(achievementsByUserId, usernameByUserId, userId) {
	if (!achievementsByUserId[userId]) {
		achievementsByUserId[userId] = {
			userId: userId,
			username: usernameByUserId[userId],
			level1: 0,
			achievementsLevel1: [],
			level2: 0,
			achievementsLevel2: [],
			level3: 0,
			achievementsLevel3: [],
			rank: 0
		};
	}

	return achievementsByUserId;
};

const updateAchievementsByUserId = function(
	achievementsByUserId,
	achievementsById,
	usernameByUserId,
	userId,
	achievementId,
	afterNumber,
	beforeNumber
) {
	achievementsByUserId = initializeAchievementsByUserId(achievementsByUserId, usernameByUserId, userId);

	const achievement = achievementsById[achievementId];
	if (achievement) {
		for (let level of achievement.levels) {
			if (afterNumber >= level.number && beforeNumber < level.number) {
				achievementsByUserId[userId]['level' + level.level] += 1;
				achievementsByUserId[userId]['achievementsLevel' + level.level].push(achievementId);
				achievementsByUserId[userId]['rank'] += level.level;
			}
		}
	}

	return achievementsByUserId;
};
