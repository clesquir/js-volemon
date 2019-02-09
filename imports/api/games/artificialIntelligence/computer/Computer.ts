import {ArtificialIntelligenceData} from "../ArtificialIntelligenceData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {ArtificialIntelligencePositionData} from "../ArtificialIntelligencePositionData";

export default interface Computer {
	key: string;
	left: boolean;
	right: boolean;
	jump: boolean;
	dropshot: boolean;

	currentGeneration(): number;

	getGenomes(): string;

	startGame();

	startPoint();

	stopPoint(pointSide: string);

	computeMovement(
		modifiers: ArtificialIntelligenceData,
		computerPosition: ArtificialIntelligencePositionData,
		ballPosition: ArtificialIntelligencePositionData,
		bonusesPosition: ArtificialIntelligencePositionData[],
		gameConfiguration: GameConfiguration
	);
}
