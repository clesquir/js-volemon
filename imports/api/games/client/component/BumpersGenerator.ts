import MainScene from "../scene/MainScene";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import {DEPTH_BUMPERS} from "../../constants";
import SkinManager from "./SkinManager";
import Level from "./Level";

export default class BumpersGenerator {
	scene: MainScene;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	level: Level;

	private isGenerated: boolean = false;
	private bumpers: Phaser.Sprite[] = [];
	private readonly animationDuration = 250;

	constructor(
		scene: MainScene,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		level: Level
	) {
		this.scene = scene;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.level = level;
	}

	enable() {
		if (this.isGenerated === false) {
			const sixthWidth = this.gameConfiguration.width() / 6;
			const tenthHeight = this.gameConfiguration.height() / 10;

			this.createBumper(sixthWidth, tenthHeight * 2);
			this.createBumper(sixthWidth, tenthHeight * 5.5);

			this.createBumper(sixthWidth * 2, tenthHeight * 3.75);

			this.createBumper(sixthWidth * 3, tenthHeight * 2);
			this.createBumper(sixthWidth * 3, tenthHeight * 5.5);

			this.createBumper(sixthWidth * 4, tenthHeight * 3.75);

			this.createBumper(sixthWidth * 5, tenthHeight * 2);
			this.createBumper(sixthWidth * 5, tenthHeight * 5.5);

			this.isGenerated = true;
		}

		for (let bumper of this.bumpers) {
			bumper.body.setCollisionGroup(this.level.collisionCategoryBumper);
			this.scene.game.add.tween(bumper.scale).to({x: 1, y: 1}, this.animationDuration).start();
		}
	}

	disable() {
		for (let bumper of this.bumpers) {
			bumper.scale.setTo(1);
			bumper.body.setCollisionGroup(this.scene.game.physics.p2.nothingCollisionGroup);
			this.scene.game.add.tween(bumper.scale).to({x: 0, y: 0}, this.animationDuration).start();
		}
	}

	private createBumper(x: number, y: number) {
		const bumper = this.scene.game.add.sprite(
			x,
			y,
			this.skinManager.skinKey(),
			'bumper'
		);
		bumper.anchor.setTo(0.5);
		this.scene.game.physics.p2.enable(bumper, this.scene.game.config.enableDebug);
		bumper.body.static = true;

		bumper.data.isBumper = true;

		// @ts-ignore
		bumper.depth = DEPTH_BUMPERS;
		this.scene.zIndexGroup.add(bumper);

		bumper.body.clearShapes();
		bumper.body.addCircle(this.gameConfiguration.bumperRadius());
		bumper.scale.setTo(0);

		bumper.body.setMaterial(this.level.materialBumper);
		bumper.body.collides(this.level.collisionCategoryClient, this.onBumperCollided, this);
		bumper.body.collides(this.level.collisionCategoryHost, this.onBumperCollided, this);
		bumper.body.collides(this.level.collisionCategoryBall, this.onBumperCollided, this);
		bumper.body.collides(this.level.collisionCategoryBonus, this.onBumperCollided, this);

		this.bumpers.push(bumper);
	}

	private onBumperCollided(bonusBody: Phaser.Physics.P2.Body) {
		const bumper = bonusBody.sprite;
		const time = 100;

		this.scene.game.add.tween(bumper.scale)
			.to({x: 1.2, y: 1.2}, time)
			.to({x: 1, y: 1}, time)
			.start();
	}
}
