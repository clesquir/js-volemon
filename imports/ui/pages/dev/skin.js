import Skin from '/imports/api/games/client/dev/Skin';
import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {SKIN_DEFAULT} from '/imports/api/skins/skinConstants.js';
import {Skins} from '/imports/api/skins/skins.js';
import {padNumber} from '/imports/lib/utils.js';
import {
	CONDITION_CLEAR, CONDITION_CLOUD, CONDITION_FOG, CONDITION_RAIN, CONDITION_SNOW, CONDITION_THUNDER, CONDITION_WIND,
	TIME_OF_DAY_DAYLIGHT,
	TIME_OF_DAY_NIGHT,
	TIME_OF_DAY_TWILIGHT
} from '/imports/lib/weatherApi/WeatherApi';
import {Template} from 'meteor/templating';

import './skin.html';

/** @type {Skin}|null */
let skin = null;

Template.skin.rendered = function() {
	Session.set('dev.skin.currentSkin', SKIN_DEFAULT);
	Session.set('dev.skin.currentMode', ONE_VS_ONE_GAME_MODE);
	Session.set('dev.skin.pluginEnabled', false);
	Session.set('dev.skin.timeOfDay', TIME_OF_DAY_TWILIGHT);
	Session.set('dev.skin.condition', CONDITION_CLEAR);
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

	pluginEnabled: function() {
		return Session.get('dev.skin.pluginEnabled');
	},

	timeOfDayTwilightSelected: function() {
		return Session.get('dev.skin.timeOfDay') === TIME_OF_DAY_TWILIGHT;
	},

	timeOfDayTwilight: function() {
		return TIME_OF_DAY_TWILIGHT;
	},

	timeOfDayDaylightSelected: function() {
		return Session.get('dev.skin.timeOfDay') === TIME_OF_DAY_DAYLIGHT;
	},

	timeOfDayDaylight: function() {
		return TIME_OF_DAY_DAYLIGHT;
	},

	timeOfDayNightSelected: function() {
		return Session.get('dev.skin.timeOfDay') === TIME_OF_DAY_NIGHT;
	},

	timeOfDayNight: function() {
		return TIME_OF_DAY_NIGHT;
	},

	conditionClearSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_CLEAR;
	},

	conditionClear: function() {
		return CONDITION_CLEAR;
	},

	conditionRainSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_RAIN;
	},

	conditionRain: function() {
		return CONDITION_RAIN;
	},

	conditionThunderSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_THUNDER;
	},

	conditionThunder: function() {
		return CONDITION_THUNDER;
	},

	conditionSnowSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_SNOW;
	},

	conditionSnow: function() {
		return CONDITION_SNOW;
	},

	conditionFogSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_FOG;
	},

	conditionFog: function() {
		return CONDITION_FOG;
	},

	conditionWindSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_WIND;
	},

	conditionWind: function() {
		return CONDITION_WIND;
	},

	conditionCloudSelected: function() {
		return Session.get('dev.skin.condition') === CONDITION_CLOUD;
	},

	conditionCloud: function() {
		return CONDITION_CLOUD;
	},

	hostPoints: function() {
		let points = 0;

		if (skin && skin.gameData) {
			points = skin.gameData.hostPoints;
		}

		return padNumber(points);
	},

	clientPoints: function() {
		let points = 0;

		if (skin && skin.gameData) {
			points = skin.gameData.clientPoints;
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

	'click [data-action="switch-plugin"]': function() {
		Session.set('dev.skin.pluginEnabled', !Session.get('dev.skin.pluginEnabled'));

		skin.stop();
		skin = new Skin();
		skin.start();
	},

	'click [data-action="change-time-of-day"]': function(e) {
		Session.set('dev.skin.timeOfDay', $(e.currentTarget).attr('data-time-of-day-id'));

		if (Session.get('dev.skin.pluginEnabled')) {
			skin.stop();
			skin = new Skin();
			skin.start();
		}
	},

	'click [data-action="change-condition"]': function(e) {
		Session.set('dev.skin.condition', $(e.currentTarget).attr('data-condition-id'));

		if (Session.get('dev.skin.pluginEnabled')) {
			skin.stop();
			skin = new Skin();
			skin.start();
		}
	},

	'click [data-action="cheer-host"]': function() {
		skin.cheerPlayer(true);
	},

	'click [data-action="cheer-client"]': function() {
		skin.cheerPlayer(false);
	}
});
