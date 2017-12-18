import {Meteor} from 'meteor/meteor';
import {SKIN_DEFAULT, SKIN_DEVALTO, SKIN_MARIO_BROS} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';

Meteor.startup(function() {
	const skins = [
		{
			_id: SKIN_DEFAULT,
			name: "Default",
			displayOrder: 1
		},
		{
			_id: SKIN_DEVALTO,
			name: "Devalto",
			displayOrder: 2
		},
		{
			_id: SKIN_MARIO_BROS,
			name: "Mario bros.",
			displayOrder: 3
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

			if (actualSkin.displayOrder !== expectedSkin.displayOrder) {
				updates.displayOrder = expectedSkin.displayOrder;
			}

			if (Object.keys(updates).length) {
				Skins.update({_id: actualSkin._id}, {$set: updates});
			}
		}
	}
});
