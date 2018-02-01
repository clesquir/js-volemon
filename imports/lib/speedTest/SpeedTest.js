export default class SpeedTest {
	constructor(maxTime = 2500, expiry = 5000) {
		this.maxTime = maxTime;
		this.expiry = expiry;
		this.images = [
			{name: 'NJdf53v.png', timeout: 2000},
			{name: 'LBb4FWs.png', timeout: 1200},
			{name: 'EOfOOWU.png', timeout: 1300},
			{name: 'WSFyzlx.png', timeout: 1500},
			{name: 'EaDz5qx.jpg', timeout: 1200},
			{name: 'bQnWhRY.jpg', timeout: 1200},
			{name: 'cFCdlwi.jpg', timeout: 1200}
		];
	}

	check(callback, override) {
		const lastSpeedTestRequest = localStorage.getItem('lastSpeedTestRequest') || 0;

		if (this.currentTime() - lastSpeedTestRequest > this.expiry || override) {
			this.checkSpeed(callback);
			localStorage.setItem('lastSpeedTestRequest', this.currentTime());
		} else {
			callback(parseInt(localStorage.getItem('lastSpeedTestResult')));
		}
	}

	/**
	 * @private
	 * @returns {number|string}
	 */
	currentTime() {
		return (new Date()).getTime();
	}

	/**
	 * @private
	 * @param callback
	 */
	checkSpeed(callback) {
		this.speeds = [];
		this.currentImageIndex = 0;
		this.done = false;
		this.dl = new XMLHttpRequest();

		this.runTest(callback);

		this.limiter = setTimeout(() => {
			this.done = true;
			this.dl.abort();
			clearTimeout(this.timer);
			this.calculate(callback);
		}, this.maxTime);
	}

	/**
	 * @private
	 * @param callback
	 */
	runTest(callback) {
		const image = this.images[this.currentImageIndex];
		const st = this.currentTime();

		this.dl.onload = (e) => {
			const et = this.currentTime();
			clearTimeout(this.timer);

			const d = (et - st) / 1000;

			this.speeds.push(e.loaded / d);
			this.currentImageIndex++;

			if (this.currentImageIndex < this.images.length && !this.done) {
				this.runTest();
			} else {
				clearTimeout(this.limiter);
				this.calculate(callback);
			}
		};

		this.dl.open('GET', '/assets/speed-test/' + image.name + '?ipignore=true&' + st, true);
		this.dl.send();

		this.timer = setTimeout(() => {
			this.dl.abort();
			this.done = true;
			clearTimeout(this.limiter);
			this.calculate(callback);
		}, image.timeout);
	}

	/**
	 * @private
	 * @param callback
	 */
	calculate(callback) {
		let sum = 0;
		const l = this.speeds.length;

		for (let i = 0; i < l; i++) {
			sum += this.speeds[i];
		}

		let speed = Math.round((sum / l) / 125);

		if (isNaN(speed)) {
			speed = 0;
		}

		if (callback) {
			callback(speed);
		}
		localStorage.setItem('lastSpeedTestResult', speed);
	}
}
