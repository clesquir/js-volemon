import Dev from "./Dev";

export default class Engine extends Dev {
	defaultShape: string = 'half-circle';
	defaultScale: number = 1;

	overrideGame() {
		super.overrideGame();

		this.gameData.secondPlayerComputer = true;
		this.gameData.getPlayerShapeFromKey = () => {
			return this.defaultShape;
		};
		this.gameConfiguration.initialPlayerScale = () => {
			return this.defaultScale;
		};
	}

	changeDefaultShape(shape: string) {
		this.defaultShape = shape;
	}

	changeDefaultScale(scale: number) {
		this.defaultScale = scale;
	}
}
