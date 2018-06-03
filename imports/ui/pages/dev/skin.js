import Skin from '/imports/api/games/client/dev/Skin.js';
import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {SKIN_DEFAULT} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {ReactiveVar} from 'meteor/reactive-var';
import {Template} from 'meteor/templating';

import './skin.html';

/** @type {Skin}|null */
let skin = null;

Template.skin.rendered = function() {
	Session.set('dev.skin.currentSkin', SKIN_DEFAULT);
	Session.set('dev.skin.currentMode', ONE_VS_ONE_GAME_MODE);
	skin = new Skin();
	skin.start();
};

Template.skin.destroyed = function() {
	if (skin) {
		skin.stop();
	}
};

Template.skin.helpers({
	skins: function() {
		return Skins.find();
	},

	skinIsSelected: function(id) {
		return Session.get('dev.skin.currentSkin') === id;
	},

	modeIsSelected: function(mode) {
		return Session.get('dev.skin.currentMode') === mode;
	}
});

Template.skin.events({
	'click [data-action="change-skin"]': function(e) {
		Session.set('dev.skin.currentSkin', $(e.currentTarget).attr('data-skin-id'));

		skin.stop();
		skin = new Skin();
		skin.start();
	},

	'click [data-action="change-mode"]': function(e) {
		Session.set('dev.skin.currentMode', $(e.currentTarget).attr('data-mode-id'));

		skin.stop();
		skin = new Skin();
		skin.start();
	}
});
