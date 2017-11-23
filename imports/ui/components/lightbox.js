import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';

import './lightbox.html';

Template.lightbox.rendered = function() {
	$(window).on('keydown', function(e) {
		if (e.which === 27) {
			Session.set('lightbox', null);

			if (actionOnLighboxClose) {
				actionOnLighboxClose();
				actionOnLighboxClose = null;
			}
		}
	});
};

Template.lightbox.helpers({
	visible: function() {
		if (Session.get('lightbox')) {
			$('body').addClass('active-lightbox');
		} else {
			$('body').removeClass('active-lightbox');
		}

		return Session.get('lightbox');
	},
	template: function() {
		return Session.get('lightbox');
	}
});

Template.lightbox.events({
	'click [data-action="lightbox-close"]': function(e) {
		Session.set('lightbox', null);

		if (actionOnLighboxClose) {
			actionOnLighboxClose();
			actionOnLighboxClose = null;
		}
	}
});
