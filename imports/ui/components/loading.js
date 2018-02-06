import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './loading.html';

Template.loading.helpers({
	visible: function(loadingMask) {
		return Session.get(loadingMask);
	},

	loadingText: function(loadingMask) {
		if (Session.get(loadingMask + '.text') !== undefined) {
			return Session.get(loadingMask + '.text');
		} else {
			return 'Loading...';
		}
	}
});
