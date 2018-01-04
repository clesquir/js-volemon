const Swiper = require('swiper');

export default class CardSwitcher {
	constructor(swiperSelector, callback) {
		$(document).ready(() => {
			this.swiper = new Swiper(swiperSelector, {
				direction: 'horizontal'
			});
			this.swiper.on('slideChange', callback);
		});
	}

	slideTo(slideIndex) {
		this.swiper.slideTo(slideIndex);
	}
}
