import Skin from './Skin';
import {Random} from 'meteor/random';

export default class SpaceSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'space-skin',
				imagePath: '/assets/skin/space/texture-atlas.png',
				jsonPath: '/assets/skin/space/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/space/background-${background}.png`}
		];
	}

	spriteSheetsToLoad(): { key: string; path: string; width: number; height: number }[] {
		return [];
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
			key: 'space-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3'],
				speed: 10
			}
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'space-skin',
			frame: 'net'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'space-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'space-skin',
			hostFrames: ['explosion-1', 'explosion-2'],
			clientFrames: ['explosion-1', 'explosion-2']
		};
	}
}
