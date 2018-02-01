import SkinStartup from '/imports/api/skins/client/Startup.js';
import UserStartup from '/imports/api/users/client/Startup.js';
import MobileAddressBarHider from '/imports/lib/MobileAddressBarHider.js';
import '/imports/lib/rollbar/client/Init.js';
import WeakConnectionDetector from '/imports/lib/speedTest/WeakConnectionDetector.js';
import WindowFocus from '/imports/lib/WindowFocus.js';
import './connectionMonitor.js';
import './register-api.js';
import './routes.js';

Meteor.startup(() => {
	SkinStartup.start();
	UserStartup.start();
	MobileAddressBarHider.start();
	WindowFocus.start();
	WeakConnectionDetector.start();
});
