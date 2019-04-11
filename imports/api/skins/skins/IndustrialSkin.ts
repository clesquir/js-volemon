import Skin from './Skin';
import {Random} from 'meteor/random';

export default class IndustrialSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'industrial-skin',
				imagePath: '/assets/skin/industrial/texture-atlas.png',
				jsonPath: '/assets/skin/industrial/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/industrial/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#000000';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: 'industrial-skin',
            frame: 'ball'
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'industrial-skin',
			frame: 'net'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'industrial-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'industrial-skin',
			hostFrames: ['spark-1', 'spark-2', 'spark-3', 'spark-4'],
			clientFrames: ['spark-1', 'spark-2', 'spark-3', 'spark-4']
		};
	}
}
