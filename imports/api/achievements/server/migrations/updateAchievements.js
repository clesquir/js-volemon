import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js'

Meteor.startup(function () {
	/**
	 * Migration for updating achievements
	 */
	const ninja = Achievements.findOne({_id: ACHIEVEMENT_NINJA});
	if (ninja !== undefined && ninja.description === "# of games without activating any bonuses") {
		Achievements.update(
			{_id: ACHIEVEMENT_NINJA},
			{$set: {"description": "# of games over 2:00 without activating any bonuses"}}
		);
	}
});
