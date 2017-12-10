import {Meteor} from 'meteor/meteor';
import {SKIN_DEFAULT, SKIN_DEVALTO} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

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

	Skins.remove({_id: 'weather'});

	const configurations = UserConfigurations.find({skinId: 'weather'});
	configurations.forEach(function(configuration) {
		UserConfigurations.update({_id: configuration._id}, {$set: {skinId: SKIN_DEFAULT, pluginWeatherAdaptiveEnabled: 1}})
	});
});
