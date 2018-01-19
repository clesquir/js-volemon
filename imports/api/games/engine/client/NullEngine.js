import Engine from '/imports/api/games/engine/Engine.js';

export default class NullEngine extends Engine {
	freeze(sprite) {
		sprite.data.isFrozen = true;
	}

	unfreeze(sprite) {
		sprite.data.isFrozen = false;
	}

	getIsFrozen(sprite) {
		return sprite.data.isFrozen;
	}

	setMass(sprite, mass) {
		sprite.data.mass = mass;
	}

	getMass(sprite) {
		return sprite.data.mass;
	}

	setGravity(sprite, gravity) {
		sprite.data.gravity = gravity;
	}

	getGravity(sprite) {
		return sprite.data.gravity;
	}

	addBonus(x, bonusGravityScale, bonus, bonusZIndexGroup) {
		return {data: {}};
	}
}
