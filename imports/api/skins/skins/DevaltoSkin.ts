import {Random} from 'meteor/random';
import Skin from './Skin';

export default class DevaltoSkin implements Skin {
	init() {
	}

	key(): string {
		return 'devalto-skin';
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: this.key(),
				imagePath: '/assets/skin/devalto/texture-atlas.png',
				jsonPath: '/assets/skin/devalto/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { path: string; key: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/devalto/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#83d8e8';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		const ballImage = Random.choice(
			[
				'abdellah',
				'cedric',
				'christian',
				'christophe',
				'david',
				'eugenie',
				'francois',
				'jm',
				'jeff',
				'julien',
				'luc',
				'macarena',
				'mathieu',
				'sarah',
				'stephane',
				'sylvain',
				'vincent',
				'yanick',
				'yannick'
			]
		);

		return {
			key: this.key(),
			frame: 'ball-' + ballImage
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'net'
		};
	}

	soccerNetComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'soccer-net'
		};
	}

	soccerPostComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'soccer-post'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: this.key(),
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: this.key(),
			hostFrames: ['confettis-logalto'],
			clientFrames: ['confettis-logalto']
		};
	}
}
