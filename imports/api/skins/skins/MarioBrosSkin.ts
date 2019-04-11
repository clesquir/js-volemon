import Skin from './Skin';
import {Random} from 'meteor/random';

export default class MarioBrosSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'mario-bros-skin',
				imagePath: '/assets/skin/mario-bros/texture-atlas.png',
				jsonPath: '/assets/skin/mario-bros/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		return [];
	}

	backgroundColor(): string {
		return '#6b8cff';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{
				key: 'mario-bros-skin',
				frame: 'background-mountain',
				x: 145,
				y: ySize - 158,
				width: 200,
				height: 88
			},
			{
				key: 'mario-bros-skin',
				frame: 'background-bush',
				x: xSize - 350,
				y: ySize - 110,
				width: 120,
				height: 40
			},
			{
				key: 'mario-bros-skin',
				frame: 'background-cloud',
				x: xSize - 290,
				y: 86,
				width: 160,
				height: 60
			}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: 'mario-bros-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3', 'ball-4'],
				speed: 5
			}
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'mario-bros-skin',
			frame: 'net'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'mario-bros-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'mario-bros-skin',
			hostFrames: ['confettis-goomba-light'],
			clientFrames: ['confettis-goomba-dark']
		};
	}
}
