import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_ALL_BONUSES_IN_A_GAME,
	ACHIEVEMENT_FULL_STOP,
	ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
	ACHIEVEMENT_HOW_TO_TIE_A_TIE,
	ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_NINJA,
	ACHIEVEMENT_RANDOM_IN_A_GAME,
	ACHIEVEMENT_SHUTOUTS,
	ACHIEVEMENT_SNOOZER
} from '/imports/api/achievements/constants.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	/**
	 * Migration for updating achievements
	 */
	updateConditionalForTournamentGame(ACHIEVEMENT_SHUTOUTS);
	updateConditionalForTournamentGame(ACHIEVEMENT_ALL_BONUSES_IN_A_GAME);
	updateConditionalForTournamentGame(ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME);
	updateConditionalForTournamentGame(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE);
	updateConditionalForTournamentGame(ACHIEVEMENT_RANDOM_IN_A_GAME);
	updateConditionalForTournamentGame(ACHIEVEMENT_HOW_TO_TIE_A_TIE);
	updateConditionalForTournamentGame(ACHIEVEMENT_NINJA);
	updateConditionalForTournamentGame(ACHIEVEMENT_SNOOZER);
	updateConditionalForTournamentGame(ACHIEVEMENT_FULL_STOP);
});

const updateConditionalForTournamentGame = function(id) {
	const achievement = Achievements.findOne({_id: id});
	if (achievement !== undefined && !achievement.conditionalForTournamentGame) {
		Achievements.update(
			{_id: id},
			{
				$set: {
					conditionalForTournamentGame: true
				}
			}
		);
	}
};
