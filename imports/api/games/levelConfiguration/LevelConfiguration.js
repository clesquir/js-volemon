export default class LevelConfiguration {
	width = 0;
	height = 0;
	groundHeight = 0;
	netHeight = 0;
	netWidth = 0;

	constructor(width, height, groundHeight, netHeight, netWidth) {
		this.width = width;
		this.height = height;
		this.groundHeight = groundHeight;
		this.netHeight = netHeight;
		this.netWidth = netWidth;
	}

	playerWidth() {
		return 98;
	}

	playerHeight() {
		return 49;
	}

	playerInitialY() {
		return this.height - this.groundHeight - (this.playerHeight() / 2);
	}

	player1InitialX() {
		return 140;
	}

	player2InitialX() {
		return this.width - this.player1InitialX();
	}

	player3InitialX() {
		return this.player1InitialX() + this.playerWidth() * 2;
	}

	player4InitialX() {
		return this.width - this.player3InitialX();
	}

	ballRadius() {
		return 12;
	}

	ballInitialY() {
		return this.height - this.groundHeight - 300;
	}

	ballInitialHostX() {
		return this.player1InitialX() + (this.playerWidth() / 4) + this.ballRadius();
	}

	ballInitialClientX() {
		return this.player2InitialX() - (this.playerWidth() / 4) - this.ballRadius();
	}

	/**
	 * @returns {LevelConfiguration}
	 */
	static defaultConfiguration() {
		return new LevelConfiguration(
			840,
			560,
			70,
			70,
			8
		);
	}

	/**
	 * @returns {LevelConfiguration}
	 */
	static defaultTwoVersusTwoConfiguration() {
		return new LevelConfiguration(
			1020,
			680,
			70,
			71,
			8
		);
	}

	/**
	 * @param {number} width
	 * @param {number} height
	 * @returns {LevelConfiguration}
	 */
	static definedSize(width, height) {
		const configuration = LevelConfiguration.defaultConfiguration();

		configuration.width = width;
		configuration.height = height;

		return configuration;
	}
}
