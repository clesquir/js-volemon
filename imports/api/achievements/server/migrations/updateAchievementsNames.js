import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_POINT_TIME,
	ACHIEVEMENT_GAME_TIME,
	ACHIEVEMENT_GAMES_PLAYED,
	ACHIEVEMENT_SHUTOUTS,
	ACHIEVEMENT_CONSECUTIVE_WON_GAMES,
	ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
	ACHIEVEMENT_PAUSE_IN_A_POINT,
	ACHIEVEMENT_PAUSE_IN_A_GAME,
	ACHIEVEMENT_PAUSE_IN_A_LIFETIME,
	ACHIEVEMENT_INVISIBLE_IN_A_POINT,
	ACHIEVEMENT_INVISIBLE_IN_A_GAME,
	ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_BONUSES_IN_A_POINT,
	ACHIEVEMENT_BONUSES_IN_A_GAME,
	ACHIEVEMENT_BONUSES_IN_A_LIFETIME,
	ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES,
	ACHIEVEMENT_ALL_BONUSES_IN_A_GAME
} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating achievement names/descriptions
	 */
	const achievements = Achievements.find({description: {$exists: false}});
	achievements.forEach(function(achievement) {
		let name = '';

		switch (achievement._id) {
			case ACHIEVEMENT_POINT_TIME:
				name = "Why won't you die?";
				break;
			case ACHIEVEMENT_GAME_TIME:
				name = "It is never ending!";
				break;
			case ACHIEVEMENT_GAMES_PLAYED:
				name = "Warm-up";
				break;
			case ACHIEVEMENT_SHUTOUTS:
				name = "Bulletproof";
				break;
			case ACHIEVEMENT_CONSECUTIVE_WON_GAMES:
				name = "Undefeatable";
				break;
			case ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED:
				name = "I'm an addict...";
				break;
			case ACHIEVEMENT_PAUSE_IN_A_POINT:
				name = "Ice baby";
				break;
			case ACHIEVEMENT_PAUSE_IN_A_GAME:
				name = "Barely moving";
				break;
			case ACHIEVEMENT_PAUSE_IN_A_LIFETIME:
				name = "Frozen fossil";
				break;
			case ACHIEVEMENT_INVISIBLE_IN_A_POINT:
				name = "Blindfolded";
				break;
			case ACHIEVEMENT_INVISIBLE_IN_A_GAME:
				name = "Vision loss";
				break;
			case ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME:
				name = "No idea what I'm doing";
				break;
			case ACHIEVEMENT_BONUSES_IN_A_POINT:
				name = "Mine, mine";
				break;
			case ACHIEVEMENT_BONUSES_IN_A_GAME:
				name = "All mine!";
				break;
			case ACHIEVEMENT_BONUSES_IN_A_LIFETIME:
				name = "Bonuses magnet";
				break;
			case ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES:
				name = "Fully equipped";
				break;
			case ACHIEVEMENT_ALL_BONUSES_IN_A_GAME:
				name = "Catch'em all";
				break;
		}

		Achievements.update(
			{_id: achievement._id},
			{$set: {name: name, description: achievement.name}}
		);
	});
});
