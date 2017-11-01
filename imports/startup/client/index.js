import '/imports/lib/rollbar/client/Init.js';
import './routes.js';
import './connectionMonitor.js';
import './register-api.js';
import WindowFocus from '/imports/lib/WindowFocus.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';

WindowFocus.init();

if (onMobileAndTablet()) {
	const hideMobileAddressBar = function() {
		setTimeout(function(){
			//Hides the address bar!
			window.scrollTo(0, 1);
		}, 0);
	};

	window.addEventListener('load', hideMobileAddressBar);
	window.addEventListener('orientationchange', hideMobileAddressBar);
}
