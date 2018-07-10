import SkinStartup from '/imports/api/skins/client/Startup.js';
import UserStartup from '/imports/api/users/client/Startup.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import PageUnload from '/imports/lib/events/PageUnload.js';
import InternetConnectionDetector from '/imports/lib/InternetConnectionDetector.js';
import MobileAddressBarHider from '/imports/lib/MobileAddressBarHider.js';
import '/imports/lib/rollbar/client/Init.js';
import WindowFocus from '/imports/lib/WindowFocus.js';
import './connectionMonitor.js';
import './register-api.js';
import './routes.js';

Meteor.startup(() => {
	SkinStartup.start();
	UserStartup.start();
	MobileAddressBarHider.start();
	WindowFocus.start();
	InternetConnectionDetector.start();

	window.onbeforeunload = function(e) {
		const event = (e || window.event);

		EventPublisher.publish(new PageUnload(event));
	};
});
