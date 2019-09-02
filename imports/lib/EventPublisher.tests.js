import {assert} from 'chai';
import sinon from 'sinon';
import EventPublisher from '/imports/lib/EventPublisher';

class EventA {
	static getClassName() {
		return 'EventA';
	}

	getClassName() {
		return EventA.getClassName();
	}
}

class EventB {
	static getClassName() {
		return 'EventB';
	}

	getClassName() {
		return EventB.getClassName();
	}
}

describe('EventPublisher', function() {
	const beforeTestListeners = EventPublisher.listeners;

	beforeEach(function() {
		EventPublisher.listeners = {};
	});

	afterEach(function() {
		EventPublisher.listeners = beforeTestListeners;
	});

	it('adds listeners with different eventName', function() {
		const firstEventName = 'firstEventName';
		const secondEventName = 'secondEventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(firstEventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[firstEventName]);
		assert.isArray(EventPublisher.listeners[firstEventName]);
		assert.lengthOf(EventPublisher.listeners[firstEventName], 1);
		assert.strictEqual(EventPublisher.listeners[firstEventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[firstEventName][0].scope, scope);

		EventPublisher.on(secondEventName, callback, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 2);

		assert.isDefined(EventPublisher.listeners[secondEventName]);
		assert.isArray(EventPublisher.listeners[secondEventName]);
		assert.lengthOf(EventPublisher.listeners[secondEventName], 1);
		assert.strictEqual(EventPublisher.listeners[secondEventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[secondEventName][0].scope, scope);
	});

	it('adds listeners with same eventName and same scope but different callback', function() {
		const eventName = 'eventName';
		const firstCallback = function() {};
		const secondCallback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, firstCallback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, firstCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.on(eventName, secondCallback, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, firstCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, secondCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);
	});

	it('adds listeners with same eventName and callback but different scope', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const firstScope = {};
		const secondScope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, firstScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);

		EventPublisher.on(eventName, callback, secondScope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, secondScope);
	});

	it('adds listeners with same eventName, callback and scope', function() {
		const eventName = 'firstEventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.on(eventName, callback, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);
	});

	it('removes listeners with same eventName, callback and scope', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, scope);
		EventPublisher.on(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);

		EventPublisher.off(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same callback and scope but different eventName', function() {
		const firstEventName = 'firstEventName';
		const secondEventName = 'secondEventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(firstEventName, callback, scope);
		EventPublisher.on(secondEventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 2);
		assert.isDefined(EventPublisher.listeners[firstEventName]);
		assert.isDefined(EventPublisher.listeners[secondEventName]);

		EventPublisher.off(firstEventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[secondEventName]);

		EventPublisher.off(secondEventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same eventName and scope but different callback', function() {
		const eventName = 'eventName';
		const firstCallback = function() {};
		const secondCallback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, firstCallback, scope);
		EventPublisher.on(eventName, secondCallback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, firstCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, secondCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);

		EventPublisher.off(eventName, firstCallback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, secondCallback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, secondCallback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same eventName and callback but different scope', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const firstScope = {};
		const secondScope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, firstScope);
		EventPublisher.on(eventName, callback, secondScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, secondScope);

		EventPublisher.off(eventName, callback, firstScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, secondScope);

		EventPublisher.off(eventName, callback, secondScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('does not do anything when removing listeners for unregistered eventName', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off('otherEventName', callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('does not do anything when removing listeners with unregistered callback for existent eventName', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, function() {}, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('does not do anything when removing listeners with unregistered scope for existent eventName and callback', function() {
		const eventName = 'eventName';
		const callback = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, callback, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, callback, {});

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].callback, callback);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('publishes to all listeners with eventName', function() {
		const callbackA = sinon.spy();
		const callbackB = sinon.spy();
		const callbackC = sinon.spy();
		const callbackD = sinon.spy();
		const scopeA = {};
		const scopeB = {};

		EventPublisher.on(EventA.getClassName(), callbackA, scopeA);
		EventPublisher.on(EventA.getClassName(), callbackB, scopeB);
		EventPublisher.on(EventB.getClassName(), callbackC, scopeA);
		EventPublisher.on(EventB.getClassName(), callbackD, scopeB);

		const eventA = new EventA();
		EventPublisher.publish(eventA);
		const eventB = new EventB();
		EventPublisher.publish(eventB);

		assert.isTrue(callbackA.calledOnce);
		assert.isTrue(callbackA.withArgs(eventA).calledOnce);
		assert.isTrue(callbackB.calledOnce);
		assert.isTrue(callbackB.withArgs(eventA).calledOnce);
		assert.isTrue(callbackC.calledOnce);
		assert.isTrue(callbackC.withArgs(eventB).calledOnce);
		assert.isTrue(callbackD.calledOnce);
		assert.isTrue(callbackD.withArgs(eventB).calledOnce);
	});

	it('does not do anything when publishing listeners for unregistered event', function() {
		const callbackA = sinon.spy();
		const scopeA = {};

		EventPublisher.on(EventA.getClassName(), callbackA, scopeA);

		const eventB = new EventB();
		EventPublisher.publish(eventB);

		assert.isTrue(callbackA.notCalled);
	});
});
