import {Meteor} from 'meteor/meteor';
import {SKIN_DEFAULT, SKIN_WEATHER} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';

Meteor.startup(function() {
	const skins = [
		{
			_id: SKIN_DEFAULT,
			name: "Default",
			displayOrder: 1
		},
		{
			_id: SKIN_WEATHER,
			name: "Weather-adaptive",
			displayOrder: 2
		}
	];

	for (let expectedSkin of skins) {
		let actualSkin = Skins.findOne({_id: expectedSkin._id});
		if (!actualSkin) {
			Skins.insert(expectedSkin);
		} else {
			const updates = {};
			if (actualSkin.name !== expectedSkin.name) {
				updates.name = expectedSkin.name;
			}

			if (Object.keys(updates).length) {
				Skins.update({_id: actualSkin._id}, {$set: updates});
			}
		}
	}
});
