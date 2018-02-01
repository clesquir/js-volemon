import {Session} from "meteor/session";
import {Template} from "meteor/templating";
import './weakConnection.html';

Template.weakConnection.helpers({
	isWeakConnectionMaskShown: function() {
		return Session.get('weakConnectionDetected');
	}
});
