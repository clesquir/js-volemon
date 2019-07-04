import {isTwoVersusTwoGameMode} from "../constants";

export default class LevelConfiguration {
	width: number = 0;
	height: number = 0;

	groundHeight: number = 70;
	netWidth: number = 8;
	netHeight: number = 72;
	soccerNetPointZoneWidth: number = 10;
	soccerNetHorizontalPostThickness: number = 10;
	soccerNetVerticalPostThickness: number = 5;
	soccerNetWidth: number = 40;
	soccerNetHeight: number = 160;

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	static defaultConfiguration(): LevelConfiguration {
		return new LevelConfiguration(840, 560);
	}

	static defaultTwoVersusTwoConfiguration(): LevelConfiguration {
		return new LevelConfiguration(1020, 680);
	}

	static fromGameMode(gameMode: string): LevelConfiguration {
		if (isTwoVersusTwoGameMode(gameMode)) {
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
}
