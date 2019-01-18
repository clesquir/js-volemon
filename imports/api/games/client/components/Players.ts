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

export default class Players {
	scene: MainScene;
	gameConfiguration: GameConfiguration;
	gameData: GameData;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	level: Level;
	artificialIntelligence: ArtificialIntelligence;

	player1: Player;
	player2: Player;
	player3: Player;
	player4: Player;

	hostNumberBallHits: number = 0;
	clientNumberBallHits: number = 0;

	lastPlayerPositionData: { [key: string]: PositionData } = {};
	lastPlayerUpdate: { [key: string]: number } = {};

	constructor (
		scene: MainScene,
		gameConfiguration: GameConfiguration,
		gameData: GameData,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		level: Level,
		artificialIntelligence: ArtificialIntelligence
	) {
		this.scene = scene;
		this.gameConfiguration = gameConfiguration;
		this.gameData = gameData;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.level = level;
		this.artificialIntelligence = artificialIntelligence;
	}

	create() {
		this.player1 = this.createPlayer('player1', '#a73030', true);
		this.player2 = this.createPlayer('player2', '#274b7a', false);

		if (this.gameData.isTwoVersusTwo()) {
			this.player3 = this.createPlayer('player3', '#d46969', true);
			this.player4 = this.createPlayer('player4', '#437bc4', false);
		}
	}

	beforeUpdate() {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player && this.gameData.isUserCreator() && player.isFrozen) {
				player.freeze();
			}
		}
	}

	updateEyes(ball: Ball) {
		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.updateEye(ball);
			}
		}
	}

	inputs(deviceController: DeviceController) {
		const player = this.getCurrentPlayer();

		if (!player) {
			return;
		}

		player.movePlayer(
			deviceController.leftPressed(),
			deviceController.rightPressed(),
			deviceController.upPressed(),
			deviceController.downPressed()
		);

		this.sendPlayerPosition(player);
	}

	moveComputers(ball: Ball) {
		for (let key of this.getComputerPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				this.moveComputer(player, ball);
			}
		}
	}

	freeze() {
		for (let key of this.getPlayerKeys(true)) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.freeze();
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

	onPlayerHitBall(player: Player, ball: Ball) {
		if (this.gameConfiguration.playerDropshotEnabled() && player.dropShots) {
			ball.dropshot();
		} else {
			if (
				this.gameConfiguration.playerSmashEnabled() &&
				player.isSmashing(ball.x())
			) {
				ball.smash(player.isHost);
			} else if (
				this.gameConfiguration.ballReboundOnPlayerEnabled() &&
				!player.isBallBelow(ball.y())
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

	private createPlayer(key, color, isHost): Player {
		return new Player(
			this.scene,
			this.gameConfiguration,
			this.gameData,
			this.level,
			key,
			color,
			isHost
		);
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

	private getPlayerFromKey(playerKey, includeRobot = true): Player | null {
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
			//@todo Robot
			// for (let i in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(i) && i === playerKey) {
			// 		return this.gameBonus.robots[i];
			// 	}
			// }
		}

		return null;
	}

	private hostPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player1'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player3');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerHostSide(this.gameBonus.robots[robotId])) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
	}

	private clientPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player2'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player4');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerClientSide(this.gameBonus.robots[robotId])) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
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
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId)) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
	}

	private isPlayerKey(key, includeRobot = true): boolean {
		const playerKeys = this.getPlayerKeys(includeRobot);

		return playerKeys.indexOf(key) >= 0;
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
			//@todo Robot
			// for (let i in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(i)) {
			// 		playerKeys.push(i);
			// 	}
			// }
		}

		return playerKeys;
	}

	private moveComputer(player: Player, ball: Ball) {
		const key = player.key;

		//Creator user controls CPU
		if (!this.gameData.isUserCreator()) {
			return;
		}

		this.artificialIntelligence.computeMovement(
			key,
			player.artificialIntelligenceData(),
			player.artificialIntelligencePositionData(),
			ball.artificialIntelligencePositionData(),
			[],
			this.gameConfiguration
		);

		player.movePlayer(
			this.artificialIntelligence.movesLeft(key),
			this.artificialIntelligence.movesRight(key),
			this.artificialIntelligence.jumps(key),
			this.artificialIntelligence.dropshots(key)
		);
	}

	private resetHostNumberBallHits() {
		this.hostNumberBallHits = 0;
	}

	private resetClientNumberBallHits() {
		this.clientNumberBallHits = 0;
	}

	private incrementBallHitsOnBallHitPlayer(player: Player, ball: Ball) {
		//Threshold to avoid several calculations for the same "touch"
		if (
			(new Date()).getTime() - player.lastBallHit > 500 &&
			this.scene.gameResumed === true &&
			this.gameData.isUserCreator()
		) {
			player.lastBallHit = (new Date()).getTime();

			let playerNumberBallHits = ++player.numberBallHits;
			let teamNumberBallHits = 0;
			if (player.isHost) {
				//Increment hit
				teamNumberBallHits = ++this.hostNumberBallHits;
				//Reset opponent
				this.resetClientNumberBallHits();
			} else if (!player.isHost) {
				//Increment hit
				teamNumberBallHits = ++this.clientNumberBallHits;
				//Reset opponent
				this.resetHostNumberBallHits();
			}

			//Reset other players
			this.resetPlayerNumberBallHitsForOthers(player);

			this.killPlayerOnBallHit(player, teamNumberBallHits, playerNumberBallHits);

			this.showTeamBallHitCount(player, ball, teamNumberBallHits);
		}
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
			//@todo Bonus
			// this.gameBonus.killPlayer(key);
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
}
