import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {SKIN_DEFAULT} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

import './skins.html';

Template.skins.helpers({
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
	'click [data-action="update-skin"]': function(e) {
		const parent = $(e.target).closest('.skin-item');
		const selectedSkin = parent.attr('data-skin');

		Meteor.call('updateSkin', selectedSkin, function(error) {
			if (!error) {
				const skin = SkinFactory.fromId(selectedSkin);
				skin.start();
			}
		});
	},

	'click [data-action="close-skin"]': function(e) {
		e.preventDefault();

		Session.set('lightbox', null);
	}
});
