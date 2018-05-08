import {Achievements} from '/imports/api/achievements/achievements.js';
import {
	ACHIEVEMENT_BATTLE_OF_THE_GIANTS,
	ACHIEVEMENT_BLANK_SCREEN,
	ACHIEVEMENT_DAVID_VS_GOLIATH,
	ACHIEVEMENT_FULL_STOP,
	ACHIEVEMENT_I_WAS_THERE_WAITING,
	ACHIEVEMENT_TEENY_TINY_WORLD
} from '/imports/api/achievements/constants.js';
import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
	/**
	 * Migration for updating achievements
	 */
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_BATTLE_OF_THE_GIANTS);
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_I_WAS_THERE_WAITING);
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_BLANK_SCREEN);
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_DAVID_VS_GOLIATH);
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_FULL_STOP);
	updateDeniedForTwoVersusTwoGame(ACHIEVEMENT_TEENY_TINY_WORLD);
});

const updateDeniedForTwoVersusTwoGame = function(id) {
	const achievement = Achievements.findOne({_id: id});
	if (achievement !== undefined && !achievement.deniedForTwoVersusTwo) {
		Achievements.update(
			{_id: id},
			{
				$set: {
					deniedForTwoVersusTwo: true
				}
			}
		);
	}
};
