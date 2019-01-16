import Dev from "./Dev";

export default class Engine extends Dev {
	defaultShape: string = 'half-circle';

	overrideGame() {
		super.overrideGame();

		this.gameData.secondPlayerComputer = true;
		this.gameData.getPlayerShapeFromKey = () => {
			return this.defaultShape;
		};
	}

	changeDefaultShape(shape: string) {
		this.defaultShape = shape;
	}
}
