import Player from "./Player";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import GameData from "../../data/GameData";
import Level from "./Level";
import Ball from "./Ball";
import ArtificialIntelligence from "../../artificialIntelligence/ArtificialIntelligence";
import {PLAYER_INTERVAL} from "../../emissionConstants";
import DeviceController from "../../deviceController/DeviceController";
import StreamBundler from "../streamBundler/StreamBundler";
import {PositionData} from "./PositionData";
import ServerNormalizedTime from "../ServerNormalizedTime";
import Animations from "./Animations";
import {ArtificialIntelligencePositionData} from "../../artificialIntelligence/ArtificialIntelligencePositionData";
import Bonuses from "./Bonuses";

export default class Players {
	scene: MainScene;
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	animations: Animations;
	level: Level;
	artificialIntelligence: ArtificialIntelligence;

	player1: Player;
	player2: Player;
	player3: Player;
	player4: Player;
	robots: {[id: string]: Player} = {};
	removedRobots: {[id: string]: boolean} = {};

	hostNumberBallHits: number = 0;
	clientNumberBallHits: number = 0;

	lastPlayerPositionData: { [key: string]: PositionData } = {};
	lastPlayerUpdate: { [key: string]: number } = {};

	private readonly playerDropshotEnabled: boolean;
	private readonly playerSmashEnabled: boolean;
	private readonly ballReboundOnPlayerEnabled: boolean;

	constructor(
		scene: MainScene,
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		animations: Animations,
		level: Level,
		artificialIntelligence: ArtificialIntelligence
	) {
		this.scene = scene;
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.animations = animations;
		this.level = level;
		this.artificialIntelligence = artificialIntelligence;

		this.playerDropshotEnabled = this.gameConfiguration.playerDropshotEnabled();
		this.playerSmashEnabled = this.gameConfiguration.playerSmashEnabled();
		this.ballReboundOnPlayerEnabled = this.gameConfiguration.ballReboundOnPlayerEnabled();
	}

	create() {
		this.player1 = this.createPlayer('player1', true, '#a73030');
		this.player2 = this.createPlayer('player2', false, '#274b7a');

		if (this.gameData.isTwoVersusTwo()) {
			this.player3 = this.createPlayer('player3', true, '#d46969');
			this.player4 = this.createPlayer('player4', false, '#437bc4');
		}
	}

	beforeUpdate() {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player && player.isFrozen) {
				player.freeze();
			}
		}
	}

	update(ballsData: ArtificialIntelligencePositionData[], bonuses: Bonuses) {
		this.updateEyes(ballsData);
		this.inputs();
		this.moveComputers(
			ballsData,
			bonuses.artificialIntelligencePositionData()
		);
	}

	freeze() {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.freeze();
			}
		}
	}

	unfreeze() {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.unfreeze();
			}
		}
	}

	moveClientPlayer(data: PositionData) {
		let player = this.getPlayerFromKey(data.key);

		if (!player && data.key.indexOf('robot-') === 0 && !data.killed) {
			player = this.createRobot(data.key, data.isHost);
		}

		if (!player) {
			return;
		}

		if (data.killed && this.gameData.isUserViewer()) {
			player.kill();
		}

		player.dropShots = data.doingDropShot;

		player.interpolate(data);
	}

	stopGame() {
		for (let key of this.getPlayerKeys(true)) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.stopGame();
			}
		}
	}

	reset() {
		this.resetHostNumberBallHits();
		this.resetClientNumberBallHits();
		this.player1.reset();
		this.player2.reset();
		if (this.gameData.isTwoVersusTwo()) {
			this.player3.reset();
			this.player4.reset();
		}
	}

	resetHostNumberBallHits() {
		this.hostNumberBallHits = 0;

		const players = this.hostPlayerKeys();

		for (let playerKey in players) {
			const player = this.getPlayerFromKey(playerKey);

			if (player) {
				player.resetBallHits();
			}
		}
	}

	resetClientNumberBallHits() {
		this.clientNumberBallHits = 0;

		const players = this.clientPlayerKeys();

		for (let playerKey in players) {
			const player = this.getPlayerFromKey(playerKey);

			if (player) {
				player.resetBallHits();
			}
		}
	}

	reviveTeammatePlayer(playerKey: string) {
		const player = this.getPlayerFromKey(playerKey);
		let teammatePlayers = [];

		if (player.isHost) {
			teammatePlayers = this.hostPlayerKeys(false);
		} else {
			teammatePlayers = this.clientPlayerKeys(false);
		}

		for (let teammatePlayerKey of teammatePlayers) {
			const teammatePlayer = this.getPlayerFromKey(teammatePlayerKey);

			if (teammatePlayer && teammatePlayer.killed) {
				teammatePlayer.revive();
				return;
			}
		}
	}

	robotHasBeenKilled(robotId: string): boolean {
		return (
			this.removedRobots[robotId] ||
			(this.robots[robotId] && this.robots[robotId].killed)
		);
	}

	createRobot(robotId: string, isHost: boolean) {
		this.gameData.addRobot(robotId);
		this.robots[robotId] = this.createPlayer(robotId, isHost, null);
		this.artificialIntelligence.addComputerWithKey(
			robotId,
			isHost,
			this.scene,
			this.gameConfiguration,
			false,
			false
		);

		return this.robots[robotId];
	}

	removeRobot(robotId: string) {
		if (this.robots[robotId]) {
			this.scene.removePlayer(robotId);
			this.robots[robotId].killed = true;
			this.removedRobots[robotId] = true;
		}
	}

	onPlayerHitBall(player: Player, ball: Ball) {
		if (this.playerDropshotEnabled && player.dropShots) {
			ball.dropshot();
		} else {
			if (
				this.playerSmashEnabled &&
				player.isSmashingBall(ball.x())
			) {
				ball.smash(player.isHost);
			} else if (
				this.ballReboundOnPlayerEnabled &&
				player.isReboundingBall(ball.y())
			) {
				ball.rebound();
			}
		}

		ball.constrainVelocity();

		this.incrementBallHitsOnBallHitPlayer(player, ball);
	}

	hasInvincibleHost(): boolean {
		const hostPlayerKeys = this.hostPlayerKeys(true);

		for (let playerKey of hostPlayerKeys) {
			const player = this.getPlayerFromKey(playerKey, true);

			if (player && player.isInvincible) {
				return true;
			}
		}

		return false;
	}

	hasInvincibleClient(): boolean {
		const clientPlayerKeys = this.clientPlayerKeys(true);

		for (let playerKey of clientPlayerKeys) {
			const player = this.getPlayerFromKey(playerKey, true);

			if (player && player.isInvincible) {
				return true;
			}
		}

		return false;
	}

	getPlayerFromKey(playerKey, includeRobot = true): Player | null {
		switch (playerKey) {
			case 'player1':
				return this.player1;
			case 'player2':
				return this.player2;
			case 'player3':
				return this.player3;
			case 'player4':
				return this.player4;
		}

		if (includeRobot) {
			for (let i in this.robots) {
				if (this.robots.hasOwnProperty(i) && i === playerKey) {
					return this.robots[i];
				}
			}
		}

		return null;
	}

	hostPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player1'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player3');
		}

		if (includeRobot) {
			for (let robotId in this.robots) {
				if (this.robots.hasOwnProperty(robotId) && this.robots[robotId].isHost) {
					playerKeys.push(robotId);
				}
			}
		}

		return playerKeys;
	}

	clientPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player2'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player4');
		}

		if (includeRobot) {
			for (let robotId in this.robots) {
				if (this.robots.hasOwnProperty(robotId) && !this.robots[robotId].isHost) {
					playerKeys.push(robotId);
				}
			}
		}

		return playerKeys;
	}

	private createPlayer(key: string, isHost: boolean, color?: string): Player {
		const player = new Player(
			this.scene,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime,
			this.animations,
			this.level,
			key,
			isHost,
			color
		);

		this.scene.sortWorldComponents();

		return player;
	}

	private updateEyes(ballsData: ArtificialIntelligencePositionData[]) {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				const closestBall = this.closestBall(player, ballsData);

				if (closestBall) {
					player.updateEye(closestBall.x, closestBall.y);
				}
			}
		}
	}

	private inputs() {
		const player = this.getCurrentPlayer();

		if (!player) {
			return;
		}

		if (this.gameIsOnGoing()) {
			player.move(
				this.deviceController.leftPressed(),
				this.deviceController.rightPressed(),
				this.deviceController.upPressed(),
				this.deviceController.downPressed()
			);
		}

		this.sendPlayerPosition(player);
	}

	private sendPlayerPosition(player: Player) {
		let playerPositionData = player.positionData();
		let playerInterval = PLAYER_INTERVAL;

		const key = player.key;

		if (JSON.stringify(this.lastPlayerPositionData[key]) === JSON.stringify(playerPositionData)) {
			playerInterval *= 2;
		}
		this.lastPlayerPositionData[key] = Object.assign({}, playerPositionData);

		this.lastPlayerUpdate[key] = this.streamBundler.addToBundledStreamsAtFrequence(
			this.lastPlayerUpdate[key] || 0,
			playerInterval,
			'moveClientPlayer-' + key,
			playerPositionData
		);
	}

	private getCurrentPlayer(): Player | null {
		const key = this.gameData.getCurrentPlayerKey();

		return this.getPlayerFromKey(key);
	}

	private getPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player1',
			'player2'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player3');
			playerKeys.push('player4');
		}

		if (includeRobot) {
			for (let robotId in this.robots) {
				if (this.robots.hasOwnProperty(robotId)) {
					playerKeys.push(robotId);
				}
			}
		}

		return playerKeys;
	}

	private getComputerPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [];

		if (this.gameData.isFirstPlayerComputer()) {
			playerKeys.push('player1');
		}
		if (this.gameData.isSecondPlayerComputer()) {
			playerKeys.push('player2');
		}
		if (this.gameData.isThirdPlayerComputer()) {
			playerKeys.push('player3');
		}
		if (this.gameData.isFourthPlayerComputer()) {
			playerKeys.push('player4');
		}

		if (includeRobot) {
			for (let i in this.robots) {
				if (this.robots.hasOwnProperty(i)) {
					playerKeys.push(i);
				}
			}
		}

		return playerKeys;
	}

	private moveComputers(
		ballsData: ArtificialIntelligencePositionData[],
		bonusesData: ArtificialIntelligencePositionData[]
	) {
		//Creator user controls CPU
		if (!this.gameData.isUserCreator()) {
			return;
		}

		for (let key of this.getComputerPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				if (this.gameIsOnGoing()) {
					const closestBall = this.closestBall(player, ballsData);

					if (closestBall) {
						this.moveComputer(
							player,
							closestBall,
							bonusesData
						);
					}
				}

				this.sendPlayerPosition(player);
			}
		}
	}

	private moveComputer(
		player: Player,
		ballData: ArtificialIntelligencePositionData,
		bonusesData: ArtificialIntelligencePositionData[]
	) {
		if (player.killed) {
			return;
		}

		const key = player.key;

		this.artificialIntelligence.computeMovement(
			key,
			player.artificialIntelligenceData(),
			player.artificialIntelligencePositionData(),
			ballData,
			bonusesData
		);

		player.move(
			this.artificialIntelligence.movesLeft(key),
			this.artificialIntelligence.movesRight(key),
			this.artificialIntelligence.jumps(key),
			this.artificialIntelligence.dropshots(key)
		);
	}

	private incrementBallHitsOnBallHitPlayer(player: Player, ball: Ball) {
		//Threshold to avoid several calculations for the same "touch"
		if (
			(new Date()).getTime() - player.lastBallHit > 500 &&
			this.scene.gameResumed === true &&
			this.gameData.isUserCreator()
		) {
			player.lastBallHit = (new Date()).getTime();

			let playerNumberBallHits = 0;
			let teamNumberBallHits = 0;
			if (player.isHost) {
				if (this.teamBallHitsStopped(player) === false) {
					//Increment hit
					playerNumberBallHits = ++player.numberBallHits;
					teamNumberBallHits = ++this.hostNumberBallHits;
				}
				//Reset opponents
				this.resetClientNumberBallHits();
			} else if (!player.isHost) {
				if (this.teamBallHitsStopped(player) === false) {
					//Increment hit
					playerNumberBallHits = ++player.numberBallHits;
					teamNumberBallHits = ++this.clientNumberBallHits;
				}
				//Reset opponents
				this.resetHostNumberBallHits();
			}

			//Reset other players (in team or not)
			this.resetPlayerNumberBallHitsForOthers(player);

			this.killPlayerOnBallHit(player, teamNumberBallHits, playerNumberBallHits);

			this.showTeamBallHitCount(player, ball, teamNumberBallHits);
		}
	}

	private teamBallHitsStopped(player: Player): boolean {
		let teammatePlayers = [];

		if (player.isHost) {
			teammatePlayers = this.hostPlayerKeys(true);
		} else {
			teammatePlayers = this.clientPlayerKeys(true);
		}

		for (let teammatePlayerKey of teammatePlayers) {
			const teammatePlayer = this.getPlayerFromKey(teammatePlayerKey);

			if (teammatePlayer && teammatePlayer.ballHitsStopped) {
				return true;
			}
		}

		return false;
	}

	private resetPlayerNumberBallHitsForOthers(player: Player) {
		const playerKeys = this.getPlayerKeys();

		for (let playerKey of playerKeys) {
			if (player.key !== playerKey) {
				const otherPlayer = this.getPlayerFromKey(playerKey);
				if (otherPlayer) {
					otherPlayer.resetBallHits();
				}
			}
		}
	}

	private killPlayerOnBallHit(player: Player, teamNumberBallHits: number, playerNumberBallHits: number) {
		if (this.gameConfiguration.exceedsTeamMaximumBallHit(teamNumberBallHits)) {
			//Kill the team
			if (player.isHost) {
				for (let key of this.hostPlayerKeys()) {
					this.delayKillPlayer(key);
				}
			} else if (!player.isHost) {
				for (let key of this.clientPlayerKeys()) {
					this.delayKillPlayer(key);
				}
			}
		} else if (this.gameConfiguration.exceedsPlayerMaximumBallHit(playerNumberBallHits)) {
			this.delayKillPlayer(player.key);
		}
	}

	private delayKillPlayer(key: string) {
		setTimeout(() => {
			this.scene.killPlayer(key);
		}, 100);
	}

	private showTeamBallHitCount(player: Player, ball: Ball, teamNumberBallHits: number) {
		if (this.gameConfiguration.overridesTeamMaximumBallHit()) {
			const x = ball.x();
			const y = ball.y();
			let color = player.isHost ? '#c94141' : '#3363a1';

			this.scene.showBallHitCount(x, y, teamNumberBallHits, color);

			//Send to client
			const serverTimestamp = this.serverNormalizedTime.getServerTimestamp();
			this.streamBundler.emitStream(
				'showBallHitCount-' + this.gameData.gameId,
				{
					x: x,
					y: y,
					ballHitCount: teamNumberBallHits,
					color: color
				},
				serverTimestamp
			);
		}
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}

	private closestBall(
		player: Player,
		ballsData: ArtificialIntelligencePositionData[]
	): ArtificialIntelligencePositionData | null {
		const playerData = player.positionData();
		let closestBallDistance = Number.POSITIVE_INFINITY;
		let closestBallData = null;

		for (let ballData of ballsData) {
			const distance = Math.sqrt(
				Math.pow(Math.abs(playerData.x - ballData.x), 2) +
				Math.pow(Math.abs(playerData.y - ballData.y), 2)
			);

			if (distance < closestBallDistance) {
				closestBallDistance = distance;
				closestBallData = ballData;
			}
		}

		return closestBallData;
	}
}
