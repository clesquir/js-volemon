import Bonus from "./Bonus";
import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import BonusFactory from "../../BonusFactory";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import {BONUS_INTERVAL} from "../../emissionConstants";
import {getRandomInt} from "../../../../lib/utils";
import {BonusStreamData} from "../../bonus/data/BonusStreamData";
import Player from "./Player";
import Level from "./Level";
import Players from "./Players";
import CloudsGenerator from "./CloudsGenerator";

export default class Bonuses {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	level: Level;
	players: Players;
	cloudsGenerator: CloudsGenerator;

	lastBonusUpdate: number = 0;
	lastBonusCreated: number = 0;
	bonusFrequenceTime: number = 0;
	lastGameRespawn: number = 0;
	bonuses: Bonus[] = [];
	activeBonuses: Bonus[] = [];
	removedBonuses: string[] = [];

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		level: Level,
		players: Players
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.level = level;
		this.players = players;

		this.cloudsGenerator = new CloudsGenerator(
			this.scene,
			this.gameData,
			this.gameConfiguration
		);
	}

	update() {
		this.checkBonuses();
		this.updatePlayerBonuses();

		for (let bonus of this.bonuses) {
			bonus.constrainVelocity();
		}

		if (this.gameData.isUserCreator()) {
			this.createBonusIfTimeHasElapsed();
			this.sendBonusesPosition();
		}
	}

	reset() {
		//Remove bonus sprites
		for (let bonus of this.bonuses) {
			this.removedBonuses.push(bonus.identifier);
			bonus.destroy();
		}
		this.bonuses = [];

		//Remove active bonuses
		for (let bonus of this.activeBonuses) {
			//@todo Bonus
			// if (bonus instanceof RobotBonus) {
			// 	this.removedRobots.push(bonus.robotId);
			// }
			// bonus.stop(this);
			//
			// this.removeActiveBonusWithIdentifier(bonus.activationIdentifier());
		}
		this.activeBonuses = [];
	}

	resumeGame() {
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.applyActiveBonuses();
		this.lastGameRespawn = Date.now();
	}

	freeze() {
		for (let bonus of this.bonuses) {
			bonus.freeze();
		}
	}

	artificialIntelligencePositionData(): ArtificialIntelligencePositionData[] {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			bonusesData.push(bonus.artificialIntelligencePositionData());
		}

		return bonusesData;
	}

	createBonus(data: BonusStreamData): Bonus {
		const bonusReference = BonusFactory.fromData(data);
		bonusReference.createdAt = data.createdAt;

		const bonus = new Bonus(
			this.scene,
			this.gameConfiguration,
			this.serverNormalizedTime,
			this.level,
			bonusReference,
			data.initialX,
			data.bonusIdentifier
		);

		this.bonuses.push(bonus);

		return bonus;
	}

	moveClientBonus(bonusIdentifier: string, data: any) {
		let correspondingBonus = this.bonusFromIdentifier(bonusIdentifier);

		if (!this.gameIsOnGoing()) {
			return;
		}

		if (!correspondingBonus) {
			//if bonus has been removed do not recreate
			if (this.removedBonuses.indexOf(bonusIdentifier) !== -1) {
				return;
			}

			data.bonusIdentifier = bonusIdentifier;
			correspondingBonus = this.createBonus(data);
		}

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		//@todo Interpolate client bonuses movements
		// this.engine.interpolateMoveTo(correspondingBonus, serverNormalizedTimestamp, data, () => {return this.gameIsOnGoing()});
	}

	onPlayerHitBonus(player: Player, bonus: Bonus) {
		if (this.gameData.isUserCreator() && player.canActivateBonuses && bonus.canActivate()) {
			const payload = bonus.payload(player.key);

			//Send to client
			this.streamBundler.emitStream(
				'activateBonus-' + this.gameData.gameId,
				payload,
				payload.activatedAt
			);

			//Activate bonus
			this.activateBonus(
				bonus.identifier,
				payload.player,
				payload.activatedAt,
				payload.x,
				payload.y,
				payload.beforeActivationData
			);
		}
	}

	activateBonus(
		bonusIdentifier: string,
		playerKey: string,
		activatedAt: number,
		x: number,
		y: number,
		beforeActivationData
	) {
		const bonus = this.bonusFromIdentifier(bonusIdentifier);

		if (!bonus) {
			return;
		}

		const bonusReference = bonus.bonusReference;
		let bonusReferenceToActivate = bonusReference.bonusToActivate();

		if (this.gameConfiguration.overridesBonusDuration() && bonusReference.canOverrideDuration()) {
			bonusReferenceToActivate.durationMilliseconds = this.gameConfiguration.bonusDuration();
		}

		bonusReferenceToActivate.reassignBeforeActivationData(beforeActivationData);
		bonusReferenceToActivate.activate(playerKey, activatedAt);
		bonusReferenceToActivate.start(this);

		//Show bonus activation animation
		//@todo Bonus animation - always to top (should be on top of cloud) - activatedBonus.setDepth(DEPTH_ACTIVATION_ANIMATION);
		// this.engine.activateAnimationBonus(x, y, bonusReferenceToActivate);

		this.deactivateSimilarBonusForPlayerKey(bonus, playerKey);

		this.activeBonuses.push(bonus);

		if (this.gameData.isUserCreator()) {
			//@todo Add an interface for Meteor.call
			Meteor.call(
				'addActiveBonusToGame',
				this.gameData.gameId,
				activatedAt,
				bonusReference.getClassName(),
				bonusReferenceToActivate.activationData()
			);
		}

		this.removeBonus(bonusIdentifier);
	}

	resetBonusesForPlayerKey(playerKey: string) {
		for (let bonus of this.activeBonuses) {
			if (bonus.getTargetPlayerKey() === playerKey && bonus.bonusReference.shouldBeRemovedWhenKilling()) {
				bonus.bonusReference.stop(this);

				//@todo Bonus
				// this.removeActiveBonusWithIdentifier(bonus.bonusReference.activationIdentifier());
			}
		}
	}

	showClouds() {
		this.cloudsGenerator.showClouds();
	}

	hideClouds() {
		this.cloudsGenerator.hideClouds();
	}

	showSmokeBomb(smokeBombIdentifier: string, xPosition: number, yPosition: number, angle: number) {
		this.cloudsGenerator.showSmokeBomb(smokeBombIdentifier, xPosition, yPosition, angle);
	}

	hideSmokeBomb(smokeBombIdentifier: string) {
		this.cloudsGenerator.hideSmokeBomb(smokeBombIdentifier);
	}

	applyHighGravity() {
		//@todo Bonus - this.gameConfiguration.worldGravity() * 2.75
	}

	applyLowGravity() {
		//@todo Bonus - this.gameConfiguration.worldGravity() * 0.55
	}

	resetGravity() {
		//@todo Bonus - this.gameConfiguration.worldGravity()
	}

	scaleSmallPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.scaleSmall();
		}
	}

	scaleBigPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.scaleBig();
		}
	}

	resetPlayerScale(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.resetScale();
		}
	}

	applyBigVerticalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.verticalMoveMultiplier = this.gameConfiguration.bigVerticalMoveMultiplier();
		}
	}

	resetVerticalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.verticalMoveMultiplier = this.gameConfiguration.initialVerticalMoveMultiplier();
		}
	}

	applyFastHorizontalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.horizontalMoveMultiplier = this.gameConfiguration.fastHorizontalMoveMultiplier();
		}
	}

	applySlowHorizontalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.horizontalMoveMultiplier = this.gameConfiguration.slowHorizontalMoveMultiplier();
		}
	}

	resetHorizontalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.horizontalMoveMultiplier = this.gameConfiguration.initialHorizontalMoveMultiplier();
		}
	}

	enablePlayerBonusActivation(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.canActivateBonuses = true;
		}
	}

	disablePlayerBonusActivation(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.canActivateBonuses = false;
		}
	}

	applyReversePlayerMove(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.isMoveReversed = true;
		}
	}

	resetReversePlayerMove(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.isMoveReversed = false;
		}
	}

	applyNoJumpPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.canJump = false;
			player.alwaysJump = false;
		}
	}

	resetNoJumpPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.canJump = true;
			player.alwaysJump = false;
		}
	}

	applyBouncePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.alwaysJump = true;
			player.canJump = false;
		}
	}

	resetBouncePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.alwaysJump = false;
			player.canJump = true;
		}
	}

	freezePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.freeze();
		}
	}

	unfreezePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.unfreeze();
		}
	}

	hidePlayerFromHimself(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.hideFromHimself();
		}
	}

	showPlayerToHimself(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.showToHimself();
		}
	}

	hidePlayerFromOpponent(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.hideFromOpponent();
		}
	}

	showPlayerToOpponent(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.showToOpponent();
		}
	}

	isPlayerInvincible(playerKey: string): boolean {
		const player = this.players.getPlayerFromKey(playerKey);

		return player && player.isInvincible;
	}

	applyInvinciblePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.isInvincible = true;
		}
	}

	resetInvinciblePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.isInvincible = false;
		}
	}

	killPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.kill();
		}
	}

	revivePlayer(playerKey: string) {
		this.players.reviveTeammatePlayer(playerKey);
	}

	shiftPlayerShape(playerKey: string, playerShape: string) {
		//@todo Bonus
	}

	resetPlayerShape(playerKey: string) {
		//@todo Bonus
	}

	resetBallHitCount(playerKey: string) {
		//@todo Bonus
	}

	scaleSmallBall() {
		this.scene.ball.scaleSmall();
	}

	scaleBigBall() {
		this.scene.ball.scaleBig();
	}

	resetBallScale() {
		this.scene.ball.resetScale();
	}

	hideBall() {
		this.scene.ball.hide();
	}

	unhideBall() {
		this.scene.ball.unhide();
	}

	private bonusFromIdentifier(bonusIdentifier: string): Bonus | null {
		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				return bonus;
			}
		}

		return null;
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}

	private deactivateSimilarBonusForPlayerKey(newBonus: Bonus, playerKey: string) {
		for (let bonus of this.activeBonuses) {
			if (bonus.bonusReference.isSimilarBonusForPlayerKey(newBonus.bonusReference, playerKey)) {
				bonus.bonusReference.deactivate();
			}
		}
	}

	private removeBonus(bonusIdentifier: string) {
		const bonuses = [];

		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				this.removedBonuses.push(bonus.identifier);
				bonus.destroy();
			} else {
				bonuses.push(bonus);
			}
		}

		this.bonuses = bonuses;
	}

	private checkBonuses() {
		const stillActiveBonuses = [];

		for (let bonus of this.activeBonuses) {
			if (bonus.check(this, this.serverNormalizedTime.getServerTimestamp())) {
				stillActiveBonuses.push(bonus);
			} else {
				//@todo Bonus Robot
				// if (bonus instanceof RobotBonus) {
				// 	this.removedRobots.push(bonus.robotId);
				// }

				if (this.gameData.isUserCreator()) {
					//@todo Add an interface for Meteor.call
					Meteor.call('removeActiveBonusFromGame', this.gameData.gameId, bonus.bonusReference.getIdentifier());
				}

				//@todo Bonus
				// this.removeActiveBonusWithIdentifier(bonus.activationIdentifier());
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	private applyActiveBonuses() {
		for (let activeBonus of this.gameData.activeBonuses()) {
			let bonus = BonusFactory.fromClassName(activeBonus.activatedBonusClass);

			if (this.gameConfiguration.overridesBonusDuration() && bonus.canOverrideDuration()) {
				bonus.durationMilliseconds = this.gameConfiguration.bonusDuration();
			}

			bonus.reassignBeforeActivationData(activeBonus.beforeActivationData);
			bonus.activate(activeBonus.targetPlayerKey, activeBonus.activatedAt);
			bonus.start(this);
			this.activeBonuses.push(activeBonus);
		}
	}

	private updatePlayerBonuses() {
		const padding = 5;
		let player1Count = 0;
		let player2Count = 0;
		let player3Count = 0;
		let player4Count = 0;

		for (let bonus of this.activeBonuses) {
			if (bonus.getTargetPlayerKey() && bonus.getTargetPlayerKey().indexOf('robot-') === -1) {
				//@todo Bonus
				// let bonusSprite = this.activatedBonusSpriteWithIdentifier(bonus.activationIdentifier());

				let xModifier = 0;
				let sideCount = 0;
				switch (bonus.getTargetPlayerKey()) {
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

				//@todo Bonus
				// if (bonusSprite === null) {
				// 	const bonusSprite = this.engine.drawBonus(
				// 		x,
				// 		this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() / 2),
				// 		BonusFactory.fromClassName(bonus.classNameToActivate(), this),
				// 		this.getBonusProgress(bonus, bonus.getDuration())
				// 	);
				// 	bonusSprite.activationIdentifier = bonus.activationIdentifier();
				// 	this.bonusesGroup.add(bonusSprite);
				// } else {
				// 	this.engine.updateBonusProgress(
				// 		x,
				// 		bonusSprite,
				// 		this.getBonusProgress(bonus, bonus.getDuration())
				// 	);
				// }
			}
		}
	}

	private sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			bonusesData.push([
				bonus.identifier,
				bonus.positionData()
			]);
		}

		if (bonusesData.length) {
			this.lastBonusUpdate = this.streamBundler.addToBundledStreamsAtFrequence(
				this.lastBonusUpdate,
				BONUS_INTERVAL,
				'moveClientBonuses',
				bonusesData
			);
		}
	}

	private createBonusIfTimeHasElapsed() {
		let frequenceTime = this.bonusFrequenceTime - Math.round((Date.now() - this.lastGameRespawn) / 10);

		if (frequenceTime < this.gameConfiguration.bonusSpawnMinimumFrequence()) {
			frequenceTime = this.gameConfiguration.bonusSpawnMinimumFrequence();
		}

		if (
			this.scene.gameResumed &&
			Date.now() - this.lastBonusCreated >= frequenceTime &&
			this.bonuses.length < this.gameConfiguration.maximumBonusesOnScreen()
		) {
			this.createRandomBonus();
		}
	}

	private createRandomBonus() {
		let bonus = BonusFactory.randomBonus(this.gameConfiguration);
		let data = bonus.dataToStream();
		data.initialX = this.gameConfiguration.width() / 2 + <number><any>Random.choice([-6, +6]);

		//Create the bonus for host
		this.createBonus(data);
		this.regenerateLastBonusCreatedAndFrequenceTime();
		//Add to bundled stream to send to client
		this.streamBundler.addStreamToBundle('createBonus', data);

		//@todo Add an interface for Meteor.call
		Meteor.call(
			'createBonus',
			this.gameData.gameId,
			data
		);
	}

	private regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = Date.now();
		this.bonusFrequenceTime = getRandomInt(
			this.gameConfiguration.bonusSpawnInitialMinimumFrequence(),
			this.gameConfiguration.bonusSpawnInitialMaximumFrequence()
		);
	}
}
