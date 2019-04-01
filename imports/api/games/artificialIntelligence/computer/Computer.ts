import {ArtificialIntelligenceData} from "../ArtificialIntelligenceData";
import {ArtificialIntelligencePositionData} from "../ArtificialIntelligencePositionData";

export default interface Computer {
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
		bonusesPosition: ArtificialIntelligencePositionData[]
	);
}
