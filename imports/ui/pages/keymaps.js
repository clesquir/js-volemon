import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {UserKeymaps} from '/imports/api/users/userKeymaps';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps';
const hotkeys = require('hotkeys-js');
const keycode = require('keycode');

import './keymaps.html';

const userMappings = function() {
	const userKeymaps = UserKeymaps.findOne({userId: Meteor.userId()});
	const customKeymaps = CustomKeymaps.fromUserKeymaps(userKeymaps);
	return customKeymaps.mapping;
};

const keycodeIsAlreadyAssigned = function(action, binding) {
	const mappings = userMappings();

	for (let mapping in mappings) {
		if (mappings.hasOwnProperty(mapping) && action !== mapping && mappings[mapping] === binding) {
			return true;
		}
	}

	return false;
};

const stopBinding = function() {
	Session.set('keymap.addView');
	Session.set('lightbox.escDisabled');
	removeCurrentBinding();
};

const resetInfoContainer = function() {
	const infoContainer = document.getElementById('keymap-info-container');
	$(infoContainer).addClass('currently-binding');
	$(infoContainer).removeClass('keymap-error');
	$(infoContainer).removeClass('keymap-error-shake');
	$(infoContainer).html('Press the key control to assign...');
};

let resetErrorShakeTimer;
let resetErrorTimer;
const addCustomKeymaps = function(action, binding) {
	const mappings = userMappings();

	if (keycodeIsAlreadyAssigned(action, binding)) {
		const infoContainer = document.getElementById('keymap-info-container');
		$(infoContainer).addClass('keymap-error');
		$(infoContainer).addClass('keymap-error-shake');
		$(infoContainer).removeClass('currently-binding');
		$(infoContainer).html('The key is already assigned!');

		Meteor.clearTimeout(resetErrorShakeTimer);
		resetErrorShakeTimer = Meteor.setTimeout(function() {
			$(infoContainer).removeClass('keymap-error-shake');
		}, 1000);
		Meteor.clearTimeout(resetErrorTimer);
		resetErrorTimer = Meteor.setTimeout(function() {
			resetInfoContainer();
		}, 5000);
	} else {
		mappings[action] = binding;
		Meteor.call('updateKeymaps', mappings);
		stopBinding();

		//Remove preset from list
		const presets = document.getElementById('keymap-presets');
		$(presets).val('null');
	}
};

const keymapsValue = function(mapping) {
	const keymap = userMappings()[mapping];

	if (keymap !== null) {
		const key = keycode(keymap);
		return key.substr(0, 1).toUpperCase() + key.slice(1);
	}

	return '';
};

const removeCurrentBinding = function() {
	const keymapList = document.getElementById('keymap-list');
	const currentBindingButtons = $(keymapList).find('.button-cell i.fa-keyboard-o');

	currentBindingButtons.each(function(index, field) {
		$(field).removeClass('currently-binding');
		$(field).removeClass('fa-keyboard-o');
		$(field).addClass('fa-pencil');
	});

	const infoContainer = document.getElementById('keymap-info-container');
	$(infoContainer).css('visibility', 'hidden');
};

Template.keymaps.onCreated(function() {
	hotkeys('*', 'keymaps', function(e) {
		if (Session.get('keymap.addView')) {
			e.preventDefault();
			if (e.which === 27) {
				Meteor.setTimeout(function() {stopBinding()}, 100);
			} else {
				addCustomKeymaps(Session.get('keymap.addView'), e.keyCode);
			}
		}
	});
	hotkeys.setScope('keymaps');
});

Template.keymaps.destroyed = function() {
	hotkeys.deleteScope('keymaps');
	stopBinding();
};

Template.keymaps.helpers({
	keymapActions: function() {
		return [
			{
				label: 'Up',
				action: 'up'
			},
			{
				label: 'Left',
				action: 'left'
			},
			{
				label: 'Right',
				action: 'right'
			},
			{
				label: 'Dropshot',
				action: 'down'
			},
			{
				label: 'Display player names',
				action: 'displayPlayerNames'
			}
		];
	},

	keymapValue: function(action) {
		return keymapsValue(action);
	},

	keymapAddViewVisible: function() {
		return false;
	}
});

Template.keymaps.events({
	'change select[name=presets]': function(e) {
		const mappings = userMappings();

		switch (e.target.value) {
			case 'arrows':
				mappings.up = 38;
				mappings.left = 37;
				mappings.right = 39;
				mappings.down = 40;
				mappings.displayPlayerNames = 'N'.charCodeAt(0);
				Meteor.call('updateKeymaps', mappings);
				break;
			case 'WASD':
				mappings.up = 'W'.charCodeAt(0);
				mappings.left = 'A'.charCodeAt(0);
				mappings.right = 'D'.charCodeAt(0);
				mappings.down = 'S'.charCodeAt(0);
				mappings.displayPlayerNames = 'N'.charCodeAt(0);
				Meteor.call('updateKeymaps', mappings);
				break;
			case 'ZQSD':
				mappings.up = 'Z'.charCodeAt(0);
				mappings.left = 'Q'.charCodeAt(0);
				mappings.right = 'D'.charCodeAt(0);
				mappings.down = 'S'.charCodeAt(0);
				mappings.displayPlayerNames = 'N'.charCodeAt(0);
				Meteor.call('updateKeymaps', mappings);
				break;
		}
	},

	'click [data-action=keymap-add-binding]': function(e) {
		removeCurrentBinding();
		$(e.target).removeClass('fa-pencil');
		$(e.target).addClass('fa-keyboard-o');
		$(e.target).addClass('currently-binding');
		const infoContainer = document.getElementById('keymap-info-container');
		resetInfoContainer();
		$(infoContainer).css('visibility', 'visible');

		const action = $(e.target).attr('data-binding-for');
		Session.set('keymap.addView', action);
		Session.set('lightbox.escDisabled', true);
	},

	'click [data-action="close-keymaps"]': function(e) {
		e.preventDefault();

		Session.set('lightbox', null);
	}
});
