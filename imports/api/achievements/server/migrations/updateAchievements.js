import {Meteor} from 'meteor/meteor';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {ACHIEVEMENT_RAKSHASA} from '/imports/api/achievements/constants.js'

Meteor.startup(function() {
	/**
	 * Migration for updating achievements
	 */
	const rakshasa = Achievements.findOne({_id: ACHIEVEMENT_RAKSHASA});
	if (rakshasa !== undefined && rakshasa.levels[2].number === 3) {
		Achievements.update(
			{_id: ACHIEVEMENT_RAKSHASA},
			{$set: {
				description: 'Morph into all shapes in a life time',
				"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 3}, {"level": 3, "number": 6}]
			}}
		);
	}
});
