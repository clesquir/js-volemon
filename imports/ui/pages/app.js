import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {Tooltips} from 'meteor/lookback:tooltips';
import {Router} from 'meteor/iron:router';

import './app.html';

export const OPEN_SELECT_BOXES = {};

Template.app.helpers({
	currentlyPlayingClass: function() {
		if (Session.get('userCurrentlyPlaying')) {
			return 'user-currently-playing';
		}

		return '';
	}
});

Template.app.events({
	'click [data-action]': function(e) {
		e.preventDefault();
	},

	'click [readonly]': function(e) {
		$(e.target).select();
	},

	'click': function(e) {
		for (let key in OPEN_SELECT_BOXES) {
			if (OPEN_SELECT_BOXES.hasOwnProperty(key)) {
				const list = document.getElementById(OPEN_SELECT_BOXES[key].listId);
				const triggerClass = OPEN_SELECT_BOXES[key].triggerClass;

				if (list && !$(e.target).is(triggerClass) && $(e.target).parents(triggerClass).length === 0) {
					if (OPEN_SELECT_BOXES[key].hideCallback) {
						OPEN_SELECT_BOXES[key].hideCallback($(list));
					} else {
						$(list).hide();
					}
					delete OPEN_SELECT_BOXES[key];
				}
			}
		}
	},

	'click [data-action=user-log-in]': function() {
		Session.set('lightbox', 'login');
	},

	'click #username-header-menu-open': function() {
		const listId = 'username-dialog-dropdown-list';
		const dropdownList = document.getElementById(listId);
		$(dropdownList).addClass('menubox-animation');

		if ($(dropdownList).is(":visible")) {
			$(dropdownList).addClass('menubox-animation');
			Meteor.setTimeout(() => {
				if ($(dropdownList)) {
					$(dropdownList).hide();
					$(dropdownList).removeClass('menubox-animation');
				}
			}, 250);
			delete OPEN_SELECT_BOXES[listId];
		} else {
			if (Session.get('userCurrentlyPlaying')) {
				return;
			}

			Meteor.setTimeout(() => {
				if (dropdownList) {
					$(dropdownList).removeClass('menubox-animation');
				}
			}, 0);

			OPEN_SELECT_BOXES[listId] = {
				triggerClass: '.username-header-menu-open',
				listId: listId,
				hideCallback: function(list) {
					list.addClass('menubox-animation');
					Meteor.setTimeout(() => {
						if (list) {
							list.hide();
							list.removeClass('menubox-animation');
						}
					}, 250);
				}
			};

			$(dropdownList).show();
		}
	},

	'click [data-action=user-edit-name]': function(e) {
		Session.set('lightbox', 'username');
	},

	'click [data-action=user-password-change]': function(e) {
		Session.set('lightbox', 'passwordChange');
	},

	'click [data-action=user-logout]': function() {
		Meteor.logout(function() {});
	},

	'click [data-action=create-game]': function(e) {
		Tooltips.hide();
		Session.set('apploadingmask', true);
		actionAfterLoginCreateUser = function() {
			Meteor.call('createGame', function(error, id) {
				Session.set('apploadingmask', false);
				if (error) {
					return alert(error);
				}

				Router.go('game', {_id: id});
			});
		};

		if (!Meteor.userId()) {
			actionOnLighboxClose = function() {
				actionAfterLoginCreateUser = null;
			};

			Session.set('apploadingmask', false);
			return Session.set('lightbox', 'login');
		}

		actionAfterLoginCreateUser();
		actionAfterLoginCreateUser = null;
	},

	'click [data-action="copy-url"]': function(e) {
		const url = $(e.target).parent('.copyable-url-input').find('input[name=url]')[0].value;
		const temporaryInput = $('<input>');

		$('body').append(temporaryInput);
		temporaryInput.val(url).select();
		document.execCommand('copy');
		temporaryInput.remove();

		$(e.target).attr('data-tooltip', 'Copied!');
		$(e.target).trigger('mouseover');

		$(e.target).mouseout(function() {
			$(e.target).attr('data-tooltip', 'Copy to clipboard');
		});
	},
});
