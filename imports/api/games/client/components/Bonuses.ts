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
import BonusIndicator from "./BonusIndicator";
import Animations from "./Animations";
import BaseBonus from "../../bonus/BaseBonus";

export default class Bonuses {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	animations: Animations;
	level: Level;
	players: Players;
	cloudsGenerator: CloudsGenerator;

	lastBonusUpdate: number = 0;
	lastBonusCreated: number = 0;
	bonusFrequenceTime: number = 0;
	lastGameRespawn: number = 0;
	bonuses: Bonus[] = [];
	activeBonuses: BaseBonus[] = [];
	removedBonuses: string[] = [];

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		animations: Animations,
		level: Level,
		players: Players
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.animations = animations;
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
		for (let bonusReference of this.activeBonuses) {
			bonusReference.stop(this);

			//@todo Bonus indicator
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
			const payload = bonus.payload(this, player.key);

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
		BonusIndicator.activateAnimation(
			this.scene,
			this.gameConfiguration,
			this.serverNormalizedTime,
			bonusReferenceToActivate,
			x,
			y,
			this.animations
		);

		this.deactivateSimilarBonusForPlayerKey(bonusReferenceToActivate, playerKey);

		this.activeBonuses.push(bonusReferenceToActivate);

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
		for (let bonusReference of this.activeBonuses) {
			if (bonusReference.getTargetPlayerKey() === playerKey && bonusReference.shouldBeRemovedWhenKilling()) {
				bonusReference.stop(this);

				//@todo Bonus indicator
				// this.removeActiveBonusWithIdentifier(bonusReference.activationIdentifier());
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
		this.scene.matter.world.setGravity(
			0,
			this.gameConfiguration.worldGravity() * this.gameConfiguration.highGravityMultiplier()
		);
	}

	applyLowGravity() {
		this.scene.matter.world.setGravity(
			0,
			this.gameConfiguration.worldGravity() * this.gameConfiguration.lowGravityMultiplier()
		);
	}

	resetGravity() {
		this.scene.matter.world.setGravity(
			0,
			this.gameConfiguration.worldGravity()
		);
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

	createRobot(playerKey: string, robotId: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			this.players.createRobot(robotId, player.isHost);
		}
	}

	removeRobot(robotId: string) {
		this.players.removeRobot(robotId);
	}

	shiftPlayerShape(playerKey: string, shape: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.shiftShape(shape);
		}
	}

	resetPlayerShape(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.resetShape();
		}
	}

	resetBallHitCount(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			if (player.isHost) {
				this.players.resetHostNumberBallHits();
			} else {
				this.players.resetClientNumberBallHits();
			}
		}
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

	private deactivateSimilarBonusForPlayerKey(newBonus: BaseBonus, playerKey: string) {
		for (let bonusReference of this.activeBonuses) {
			if (bonusReference.isSimilarBonusForPlayerKey(newBonus, playerKey)) {
				bonusReference.deactivate();
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

		for (let bonusReference of this.activeBonuses) {
			if (bonusReference.check(this, this.serverNormalizedTime.getServerTimestamp())) {
				stillActiveBonuses.push(bonusReference);
			} else {
				if (this.gameData.isUserCreator()) {
					//@todo Add an interface for Meteor.call
					Meteor.call('removeActiveBonusFromGame', this.gameData.gameId, bonusReference.getIdentifier());
				}

				//@todo Bonus indicator
				// this.removeActiveBonusWithIdentifier(bonusReference.activationIdentifier());
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	private applyActiveBonuses() {
		for (let activeBonus of this.gameData.activeBonuses()) {
			let bonusReference = BonusFactory.fromClassName(activeBonus.activatedBonusClass);

			if (this.gameConfiguration.overridesBonusDuration() && bonusReference.canOverrideDuration()) {
				bonusReference.durationMilliseconds = this.gameConfiguration.bonusDuration();
			}

			bonusReference.reassignBeforeActivationData(activeBonus.beforeActivationData);
			bonusReference.activate(activeBonus.targetPlayerKey, activeBonus.activatedAt);
			bonusReference.start(this);

			this.activeBonuses.push(bonusReference);
		}
	}

	private updatePlayerBonuses() {
		const padding = 5;
		let player1Count = 0;
		let player2Count = 0;
		let player3Count = 0;
		let player4Count = 0;

		for (let bonusReference of this.activeBonuses) {
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

				//@todo Bonus indicator
				// const x = xModifier + padding + (sideCount * ((this.gameConfiguration.bonusRadius() * 2) + padding));
				//
				// let bonusSprite = this.activatedBonusSpriteWithIdentifier(bonusReference.activationIdentifier());
				//
				// if (bonusSprite === null) {
				// 	const bonusSprite = this.engine.drawBonus(
				// 		x,
				// 		this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() / 2),
				// 		BonusFactory.fromClassName(bonusReference.classNameToActivate(), this),
				// 		this.getBonusProgress(bonusReference, bonusReference.getDuration())
				// 	);
				// 	bonusSprite.activationIdentifier = bonusReference.activationIdentifier();
				// 	this.bonusesGroup.add(bonusSprite);
				// } else {
				// 	this.engine.updateBonusProgress(
				// 		x,
				// 		bonusSprite,
				// 		this.getBonusProgress(bonusReference, bonusReference.getDuration())
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
