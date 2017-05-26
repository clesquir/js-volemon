import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class Monitor {
	constructor(userId) {
		this.userId = userId;
	}

	start() {
		this.startedAt = getUTCTimeStamp();
		this.userAchievementsTracker = UserAchievements
			.find({userId: this.userId})
			.observe({
				added: (userAchievement) => {
					if (userAchievement.modifiedAt > this.startedAt) {
						this.onUserAchievementNumberChange(
							userAchievement.achievementId,
							userAchievement.number,
							0
						);
					}
				},
				changed: (userAchievement, oldUserAchievement) => {
					if (userAchievement.number !== oldUserAchievement.number) {
						this.onUserAchievementNumberChange(
							userAchievement.achievementId,
							userAchievement.number,
							oldUserAchievement.number
						);
					}
				}
			});
	}

	stop() {
		if (this.userAchievementsTracker) {
			this.userAchievementsTracker.stop();
			this.userAchievementsTracker = null;
		}
	}

	achievementById(achievementId) {
		if (!this.achievementsById) {
			const achievements = Achievements.find();
			this.achievementsById = {};
			achievements.forEach((achievement) => {
				this.achievementsById[achievement._id] = achievement;
			});
		}

		return this.achievementsById[achievementId];
	}

	onUserAchievementNumberChange(achievementId, newNumber, oldNumber) {
		const achievement = this.achievementById(achievementId);
		const levelReached = this.levelReached(achievement, newNumber, oldNumber);
		if (levelReached !== false) {
			Meteor.clearTimeout(this.removeAchievementTimeout);

			Session.set('achievement-reached-visible', true);
			Session.set('achievement-reached', {
				type: achievement.type,
				level: levelReached.level,
				levelNumber: levelReached.number,
				name: achievement.name,
				description: achievement.description,
				number: newNumber
			});

			this.removeAchievementTimeout = Meteor.setTimeout(() => {
				Session.set('achievement-reached-visible', false);
			}, 10000);
		}
	}

	levelReached(achievement, newNumber, oldNumber) {
		let levelReached = false;

		if (achievement) {
			for (let level of achievement.levels) {
				if (oldNumber < level.number && newNumber >= level.number) {
					levelReached = level;
				}
			}
		}

		return levelReached;
	}
}
