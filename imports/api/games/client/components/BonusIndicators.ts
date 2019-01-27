import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import BaseBonus from "../../bonus/BaseBonus";
import BonusIndicator from "./BonusIndicator";
import ServerNormalizedTime from "../ServerNormalizedTime";

export default class BonusIndicators {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	serverNormalizedTime: ServerNormalizedTime;

	bonusIndicators: BonusIndicator[] = [];

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.serverNormalizedTime = serverNormalizedTime;
	}

	update(activeBonuses: BaseBonus[]) {
		const padding = 5;
		let player1Count = 0;
		let player2Count = 0;
		let player3Count = 0;
		let player4Count = 0;

		for (let bonusReference of activeBonuses) {
			if (bonusReference.getTargetPlayerKey() && bonusReference.getTargetPlayerKey().indexOf('robot-') === -1) {
				let xModifier = 0;
				let sideCount = 0;
				switch (bonusReference.getTargetPlayerKey()) {
					case 'player1':
						player1Count++;
						sideCount = player1Count;
						break;
					case 'player2':
						player2Count++;
						sideCount = player2Count;
						xModifier = (this.gameConfiguration.width() / 2);
						if (this.gameData.isTwoVersusTwo()) {
							xModifier = (this.gameConfiguration.width() / 4 * 3);
						}
						break;
					case 'player3':
						player3Count++;
						sideCount = player3Count;
						xModifier = (this.gameConfiguration.width() / 4);
						break;
					case 'player4':
						player4Count++;
						sideCount = player4Count;
						xModifier = (this.gameConfiguration.width() / 2);
						break;
				}

				const x = xModifier + padding + (sideCount * ((this.gameConfiguration.bonusRadius() * 2) + padding));
				const y = this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() / 2);

				let bonusIndicator = this.bonusIndicatorWithIdentifier(bonusReference.activationIdentifier());

				if (bonusIndicator === null) {
					bonusIndicator = new BonusIndicator(
						this.scene,
						this.gameConfiguration,
						this.serverNormalizedTime,
						bonusReference,
						x,
						y,
						bonusReference.activationIdentifier()
					);

					this.bonusIndicators.push(bonusIndicator);
				}

				bonusIndicator.updatePosition(x, y);
				bonusIndicator.updateProgress();
			}
		}
	}

	removeActiveBonusWithIdentifier(identifier: string) {
		const bonusIndicator = this.bonusIndicatorWithIdentifier(identifier);

		if (bonusIndicator) {
			bonusIndicator.destroy();
			this.bonusIndicators = this.bonusIndicators.filter(elelement => elelement !== bonusIndicator);
		}
	}

	bonusIndicatorWithIdentifier(identifier: string): BonusIndicator | null {
		for (let bonusIndicator of this.bonusIndicators) {
			if (identifier === bonusIndicator.identifier) {
				return bonusIndicator;
			}
		}

		return null;
	}
}
