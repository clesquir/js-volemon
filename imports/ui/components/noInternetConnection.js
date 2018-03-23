import {Session} from "meteor/session";
import {Template} from "meteor/templating";
import './noInternetConnection.html';

Template.noInternetConnection.helpers({
	isNoInternetConnectionMaskShown: function() {
		return Session.get('noInternetConnectionDetected');
	}
});
