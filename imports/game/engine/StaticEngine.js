export default class StaticEngine {
	constructor(x, y, velocityX, velocityY) {
		this.x = x;
		this.y = y;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
	}

	getXPosition() {
		return this.x;
	}

	getYPosition() {
		return this.y;
	}

	getHorizontalSpeed() {
		return this.velocityX;
	}

	getVerticalSpeed() {
		return this.velocityY;
	}

	setHorizontalSpeed(velocityX) {
		this.velocityX = velocityX;
	}

	setVerticalSpeed(velocityY) {
		this.velocityY = velocityY;
	}

	setGravity(gravity) {
		this.gravity = gravity;
	}

	setMass(mass) {
		this.mass = mass;
	}

	constrainVelocity() {
	}
}
