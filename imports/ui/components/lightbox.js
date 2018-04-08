import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './lightbox.html';

Template.lightbox.rendered = function() {
	$(window).on('keydown', function(e) {
		if (e.which === 27 && !Session.get('lightbox.escDisabled') && Session.get('lightbox.closable') !== false) {
			Session.set('lightbox', null);
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
	closable: function() {
		return Session.get('lightbox.closable') !== false;
	},
	template: function() {
		return Session.get('lightbox');
	}
});

Template.lightbox.events({
	'click [data-action="lightbox-close"]': function() {
		Session.set('lightbox', null);
	}
});
