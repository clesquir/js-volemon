import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';

import './loading.html';

Template.loading.helpers({
	visible: function(loadingMask) {
		return Session.get(loadingMask);
	}
});
