import {isTwoVersusTwoGameMode} from "../constants";

export default class LevelConfiguration {
	width: number = 0;
	height: number = 0;
	groundHeight: number = 0;
	netHeight: number = 0;
	netWidth: number = 0;

	constructor(
		width: number,
		height: number,
		groundHeight: number,
		netHeight: number,
		netWidth: number
	) {
		this.width = width;
		this.height = height;
		this.groundHeight = groundHeight;
		this.netHeight = netHeight;
		this.netWidth = netWidth;
	}

	static defaultConfiguration(): LevelConfiguration {
		return new LevelConfiguration(
			840,
			560,
			70,
			70,
			8
		);
	}

	static defaultTwoVersusTwoConfiguration(): LevelConfiguration {
		return new LevelConfiguration(
			1020,
			680,
			70,
			71,
			8
		);
	}

	static fromMode(mode: string): LevelConfiguration {
		if (isTwoVersusTwoGameMode(mode)) {
			return LevelConfiguration.defaultTwoVersusTwoConfiguration();
		}

		return LevelConfiguration.defaultConfiguration();
	}

	static definedSize(width: number, height: number): LevelConfiguration {
		const configuration = LevelConfiguration.defaultConfiguration();

		configuration.width = width;
		configuration.height = height;

		return configuration;
	}

	playerWidth(): number {
		return 98;
	}

	playerHeight(): number {
		return 49;
	}

	playerInitialY(): number {
		return this.height - this.groundHeight - (this.playerHeight() / 2);
	}

	player1InitialX(): number {
		return Math.round(this.width / 6);
	}

	player2InitialX(): number {
		return this.width - this.player1InitialX();
	}

	player3InitialX(): number {
		return this.player1InitialX() + this.playerWidth() * 2;
	}

	player4InitialX(): number {
		return this.width - this.player3InitialX();
	}

	ballRadius(): number {
		return 12;
	}

	ballInitialY(): number {
		return Math.round(0.3875 * (this.height - this.groundHeight));
	}

	ballInitialHostX(): number {
		return this.player1InitialX() + (this.playerWidth() / 4) + this.ballRadius();
	}

	ballInitialClientX(): number {
		return this.player2InitialX() - (this.playerWidth() / 4) - this.ballRadius();
	}
}
