import * as Moment from 'meteor/momentjs:moment';

export const padNumber = function(number, size = 2) {
	let result = String(number);
	const character = '0';

	while (result.length < size) {
		result = character + result;
	}

	return result;
};

export const getRainbowColor = function(numOfSteps, step) {
	// This function generates vibrant, "evenly spaced" colours (i.e. no clustering).
	// This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
	// Adam Cole, 2011-Sept-14
	// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	let r, g, b;
	const h = step / numOfSteps;
	const i = ~~(h * 6);
	const f = h * 6 - i;
	const q = 1 - f;
	switch(i % 6){
		case 0: r = 1; g = f; b = 0; break;
		case 1: r = q; g = 1; b = 0; break;
		case 2: r = 0; g = 1; b = f; break;
		case 3: r = 0; g = q; b = 1; break;
		case 4: r = f; g = 0; b = 1; break;
		case 5: r = 1; g = 0; b = q; break;
	}
	const c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
	return (c);
};

export const getWinRate = function(profile) {
	if (profile.numberOfWin + profile.numberOfLost === 0) {
		return 'N/A';
	} else if (profile.numberOfLost === 0) {
		return '100%';
	} else {
		return Math.round(profile.numberOfWin / (profile.numberOfWin + profile.numberOfLost) * 100) + '%';
	}
};

export const getUTCTimeStamp = function() {
	return Moment.moment.utc().valueOf();
};

export const timeElapsedSince = function(time) {
	let minutes = Moment.moment.duration(getUTCTimeStamp() - time).asMinutes();
	let hours = Math.floor(minutes / 60);
	minutes = Math.floor(minutes);

	if (minutes === 0) {
		return 'just now';
	} else if (hours === 0) {
		return minutes + 'min ago';
	} else if (hours < 12) {
		minutes -= Math.floor(hours * 60);
		return hours + 'h ' + minutes + 'min ago';
	}

	return Moment.moment(time).format('YYYY-MM-DD');
};

export const callAtFrequence = function(lastCallTime, frequenceTime, callback) {
	if (getUTCTimeStamp() - lastCallTime >= frequenceTime) {
		callback();

		lastCallTime = getUTCTimeStamp();
	}

	return lastCallTime;
};

export const sleep = function(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
};

export const getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomFloat = function(min, max) {
	return Math.random() * (max - min) + min;
};

export const roundTo = function(n, digits) {
	if (digits === undefined) {
		digits = 0;
	}

	const multiplicator = Math.pow(10, digits);
	n = parseFloat((n * multiplicator).toFixed(11));
	const value = (Math.round(n) / multiplicator);
	return +(value.toFixed(digits));
};

export const getArrayMax = function(array) {
	return array.reduce(function(a, b) {
		return Math.max(a, b);
	});
};

export const htmlEncode = function(value) {
	const charKeys = ['&', '>', '<', '"', "'"];
	const charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
	const charToEntity = {
		'&': '&amp;',
		'>': '&gt;',
		'<': '&lt;',
		'"': '&quot;',
		"'": '&#39;'
	};

	return (!value) ? value : String(value).replace(
		charToEntityRegex,
		function(match, capture) {
			return charToEntity[capture];
		}
	);
};

export const elementInRelatedView = function(element, parent) {
	return (
		element.position().top + element.height() > 0 &&
		element.position().top + element.height() < parent.height()
	);
};

export const browserSupportsWebRTC = function() {
	const DetectRTC = require('detectrtc');

	return DetectRTC.isWebRTCSupported && DetectRTC.isSctpDataChannelsSupported;
};

export const onMobileAndTablet = function() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};
