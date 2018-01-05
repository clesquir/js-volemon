const Swiper = require('swiper');

export default class CardSwitcher {
	/**
	 * @param {string} swiperSelector
	 * @param {object} swipeCallbacks
	 */
	constructor(swiperSelector, swipeCallbacks) {
		$(document).ready(() => {
			this.swiper = new Swiper(swiperSelector, {
				direction: 'horizontal'
			});

			this.swiper.on('slideChange', function() {
				const dataSlide = $(this.slides[this.activeIndex]).attr('data-slide');

				if (swipeCallbacks.hasOwnProperty(dataSlide)) {
					swipeCallbacks[dataSlide]();
				}
			});
		});
	}

	slideTo(slideIndex) {
		this.swiper.slideTo(slideIndex);
	}
}
