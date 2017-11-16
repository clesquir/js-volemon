import {onMobileAndTablet} from '/imports/lib/utils.js';

export default class MobileAddressBarHider {
	static start() {
		if (onMobileAndTablet()) {
			const hideMobileAddressBar = function() {
				setTimeout(function() {
					//Hides the address bar!
					window.scrollTo(0, 1);
				}, 0);
			};

			window.addEventListener('load', hideMobileAddressBar);
			window.addEventListener('orientationchange', hideMobileAddressBar);
		}
	}
}
