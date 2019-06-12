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
import ServerAdapter from "../serverAdapter/ServerAdapter";
import {BonusPositionData} from "../../bonus/data/BonusPositionData";
import BonusIndicators from "./BonusIndicators";

export default class Bonuses {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;
	animations: Animations;
	level: Level;
	players: Players;
	bonusIndicators: BonusIndicators;
	cloudsGenerator: CloudsGenerator;

	lastBonusUpdate: number = 0;
	lastBonusCreated: number = 0;
	bonusFrequenceTime: number = 0;
	lastGameRespawn: number = 0;
	spawnedBonusesInPoint: number = 0;
	bonuses: Bonus[] = [];
	activeBonuses: BaseBonus[] = [];
	removedBonuses: string[] = [];

	private readonly bonusSpawnMinimumFrequence: number;
	private readonly bonusSpawnInitialMinimumFrequence: number;
	private readonly bonusSpawnInitialMaximumFrequence: number;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		serverAdapter: ServerAdapter,
		animations: Animations,
		level: Level,
		players: Players
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.serverAdapter = serverAdapter;
		this.animations = animations;
		this.level = level;
		this.players = players;

		this.bonusIndicators = new BonusIndicators(
			this.scene,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime
		);
		this.cloudsGenerator = new CloudsGenerator(
			this.scene,
			this.gameData,
			this.gameConfiguration
		);

		this.bonusSpawnMinimumFrequence = this.gameConfiguration.bonusSpawnMinimumFrequence();
		this.bonusSpawnInitialMinimumFrequence = this.gameConfiguration.bonusSpawnInitialMinimumFrequence();
		this.bonusSpawnInitialMaximumFrequence = this.gameConfiguration.bonusSpawnInitialMaximumFrequence();
	}

	update() {
		if (!this.gameData.hasBonuses || !this.gameIsOnGoing()) {
			return;
		}

		this.checkBonuses();
		this.bonusIndicators.update(this.activeBonuses);

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

			this.bonusIndicators.removeActiveBonusWithIdentifier(bonusReference.activationIdentifier());
		}
		this.activeBonuses = [];
	}

	resumeGame() {
		this.regenerateLastBonusCreatedAndFrequenceTime();
		this.applyActiveBonuses();
		this.lastGameRespawn = Date.now();
		this.spawnedBonusesInPoint = 0;
	}

	stopGame() {
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
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime,
			this.level,
			bonusReference,
			data.initialX,
			data.bonusIdentifier
		);

		this.bonuses.push(bonus);

		this.scene.sortWorldComponents();

		return bonus;
	}

	moveClientBonus(bonusIdentifier: string, data: BonusPositionData) {
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

		correspondingBonus.interpolate(data);
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
			this.serverAdapter.send(
				'addActiveBonusToGame',
				[
					this.gameData.gameId,
					activatedAt,
					bonusReference.getClassName(),
					bonusReferenceToActivate.activationData()
				]
			);
		}

		this.removeBonus(bonusIdentifier);
	}

	resetBonusesForPlayerKey(playerKey: string) {
		for (let bonusReference of this.activeBonuses) {
			if (bonusReference.getTargetPlayerKey() === playerKey && bonusReference.shouldBeRemovedWhenKilling()) {
				bonusReference.stop(this);

				this.bonusIndicators.removeActiveBonusWithIdentifier(bonusReference.activationIdentifier());
			}
		}
	}

	showClouds() {
		this.cloudsGenerator.showClouds();

		this.scene.sortWorldComponents();
	}

	hideClouds() {
		this.cloudsGenerator.hideClouds();
	}

	showSmokeBomb(smokeBombIdentifier: string, xPosition: number, yPosition: number, angle: number) {
		this.cloudsGenerator.showSmokeBomb(smokeBombIdentifier, xPosition, yPosition, angle);

		this.scene.sortWorldComponents();
	}

	hideSmokeBomb(smokeBombIdentifier: string) {
		this.cloudsGenerator.hideSmokeBomb(smokeBombIdentifier);
	}

	applyHighGravity() {
		this.scene.game.physics.p2.gravity.y = this.gameConfiguration.worldGravity() * this.gameConfiguration.highGravityMultiplier();
	}

	applyLowGravity() {
		this.scene.game.physics.p2.gravity.y = this.gameConfiguration.worldGravity() * this.gameConfiguration.lowGravityMultiplier();
	}

	resetGravity() {
		this.scene.game.physics.p2.gravity.y = this.gameConfiguration.worldGravity();
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

	applySlowHorizontalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.horizontalMoveMultiplier = this.gameConfiguration.slowHorizontalMoveMultiplier();
		}
	}

	applyFastHorizontalMoveMultiplier(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.horizontalMoveMultiplier = this.gameConfiguration.fastHorizontalMoveMultiplier();
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
		this.scene.killPlayer(playerKey);
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

	stopBallHitCount(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			if (player.isHost) {
				this.players.resetHostNumberBallHits();
			} else {
				this.players.resetClientNumberBallHits();
			}

			player.ballHitsStopped = true;
		}
	}

	restartBallHitCount(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player) {
			player.ballHitsStopped = false;
		}
	}

	scaleSmallBall() {
		this.scene.balls.scaleSmall();
	}

	scaleBigBall() {
		this.scene.balls.scaleBig();
	}

	resetBallScale() {
		this.scene.balls.resetScale();
	}

	hideBall() {
		this.scene.balls.hide();
	}

	unhideBall() {
		this.scene.balls.unhide();
	}

	cloneBall() {
		this.scene.balls.clone();
	}

	clearBonuses() {
		//Remove activated bonuses
		for (let bonusReference of this.activeBonuses) {
			bonusReference.clear(this);
			this.removeActiveBonus(bonusReference);
		}
		this.activeBonuses = [];

		//Remove uncaught bonuses
		for (let bonus of this.bonuses) {
			this.removedBonuses.push(bonus.identifier);
			bonus.destroy();

			if (this.gameData.isUserCreator()) {
				this.serverAdapter.send(
					'clearBonus',
					[
						this.gameData.gameId,
						bonus.bonusReference.dataToStream()
					]
				);
			}
		}
		this.bonuses = [];
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
				this.removeActiveBonus(bonusReference);
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	private removeActiveBonus(bonusReference: BaseBonus) {
		if (this.gameData.isUserCreator()) {
			this.serverAdapter.send(
				'removeActiveBonusFromGame',
				[
					this.gameData.gameId,
					bonusReference.getIdentifier()
				]
			);
		}

		this.bonusIndicators.removeActiveBonusWithIdentifier(bonusReference.activationIdentifier());
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

		if (frequenceTime < this.bonusSpawnMinimumFrequence) {
			frequenceTime = this.bonusSpawnMinimumFrequence;
		}

		if (
			this.scene.gameResumed &&
			Date.now() - this.lastBonusCreated >= frequenceTime &&
			this.bonuses.length < this.gameConfiguration.maximumBonusesOnScreen() &&
			this.reachedMaximumBonusInPoint() === false
		) {
			this.createRandomBonus();
		}
	}

	private createRandomBonus() {
		const bonus = BonusFactory.randomBonus(this.gameConfiguration);
		const data = bonus.dataToStream();
		const distanceFromCenter = this.gameConfiguration.netWidth() / 2 + 2;
		data.initialX = this.gameConfiguration.width() / 2 + <number><any>Random.choice([-distanceFromCenter, distanceFromCenter]);

		//Create the bonus for host
		this.createBonus(data);
		this.regenerateLastBonusCreatedAndFrequenceTime();
		//Add to bundled stream to send to client
		this.streamBundler.addStreamToBundle('createBonus', data);

		this.serverAdapter.send(
			'createBonus',
			[
				this.gameData.gameId,
				data
			]
		);

		this.spawnedBonusesInPoint++;
	}

	private regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = Date.now();
		this.bonusFrequenceTime = getRandomInt(
			this.bonusSpawnInitialMinimumFrequence,
			this.bonusSpawnInitialMaximumFrequence
		);
	}

	private reachedMaximumBonusInPoint(): boolean {
		if (this.gameConfiguration.overridesMaximumBonusesInAPoint()) {
			return this.spawnedBonusesInPoint >= this.gameConfiguration.maximumBonusesInAPoint();
		}

		return false;
	}
}
