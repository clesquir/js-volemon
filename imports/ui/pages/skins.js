import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {SKIN_DEFAULT} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

import './skins.html';

Template.skins.helpers({
	weatherAdaptivePluginEnabled: function() {
		return pluginWeatherAdaptiveEnabled();
	},

	skins: function() {
		return Skins.find({}, {sort: [['displayOrder', 'asc']]});
	},

	skinIsSelected: function() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		let selectedSkin = SKIN_DEFAULT;

		if (userConfiguration && userConfiguration.skinId) {
			selectedSkin = userConfiguration.skinId;
		}

		return selectedSkin === this._id;
	}
});

Template.skins.events({
	'click [data-action="update-weather-adaptive-plugin"]': function(e) {
		const isEnabled = !pluginWeatherAdaptiveEnabled();
		switchTargetButton(e, isEnabled);

		Meteor.call('updatePluginWeatherAdaptiveEnabled', isEnabled ? 1 : 0);
	},

	'click [data-action="update-skin"]': function(e) {
		const parent = $(e.target).closest('.skin-item');
		const selectedSkin = parent.attr('data-skin');

		Meteor.call('updateSkin', selectedSkin);
	},

	'click [data-action="close-skin"]': function(e) {
		e.preventDefault();

		Session.set('lightbox', null);
	}
});

const pluginWeatherAdaptiveEnabled = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.pluginWeatherAdaptiveEnabled;
};
