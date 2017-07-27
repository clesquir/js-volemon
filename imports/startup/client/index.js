import '/imports/lib/rollbar/client/Init.js';
import '/imports/lib/override/socket.io-client.js';
import './routes.js';
import './connectionMonitor.js';
import './register-api.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';

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
