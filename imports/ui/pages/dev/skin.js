import Skin from '/imports/api/games/client/dev/Skin';
import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {SKIN_DEFAULT} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {padNumber} from '/imports/lib/utils.js';
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
	},

	hostPoints: function() {
		let points = 0;

		if (skin && skin.game) {
			points = skin.game.hostPoints;
		}

		return padNumber(points);
	},

	clientPoints: function() {
		let points = 0;

		if (skin && skin.game) {
			points = skin.game.clientPoints;
		}

		return padNumber(points);
	},

	matchTimer: function() {
		return Session.get('matchTimer');
	},

	pointTimer: function() {
		return Session.get('pointTimer');
	},
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
	},

	'click [data-action="cheer-host"]': function() {
		skin.cheerPlayer(true);
	},

	'click [data-action="cheer-client"]': function() {
		skin.cheerPlayer(false);
	}
});
