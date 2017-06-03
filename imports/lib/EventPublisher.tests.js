import {assert} from 'chai';
import sinon from 'sinon';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

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
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(firstEventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[firstEventName]);
		assert.isArray(EventPublisher.listeners[firstEventName]);
		assert.lengthOf(EventPublisher.listeners[firstEventName], 1);
		assert.strictEqual(EventPublisher.listeners[firstEventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[firstEventName][0].scope, scope);

		EventPublisher.on(secondEventName, listener, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 2);

		assert.isDefined(EventPublisher.listeners[secondEventName]);
		assert.isArray(EventPublisher.listeners[secondEventName]);
		assert.lengthOf(EventPublisher.listeners[secondEventName], 1);
		assert.strictEqual(EventPublisher.listeners[secondEventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[secondEventName][0].scope, scope);
	});

	it('adds listeners with same eventName and same scope but different listener', function() {
		const eventName = 'eventName';
		const firstListener = function() {};
		const secondListener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, firstListener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, firstListener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.on(eventName, secondListener, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, firstListener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, secondListener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);
	});

	it('adds listeners with same eventName and listener but different scope', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const firstScope = {};
		const secondScope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, firstScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);

		EventPublisher.on(eventName, listener, secondScope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, secondScope);
	});

	it('adds listeners with same eventName, listener and scope', function() {
		const eventName = 'firstEventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.on(eventName, listener, scope);
		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);

		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);
	});

	it('removes listeners with same eventName, listener and scope', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, scope);
		EventPublisher.on(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);

		EventPublisher.off(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same listener and scope but different eventName', function() {
		const firstEventName = 'firstEventName';
		const secondEventName = 'secondEventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(firstEventName, listener, scope);
		EventPublisher.on(secondEventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 2);
		assert.isDefined(EventPublisher.listeners[firstEventName]);
		assert.isDefined(EventPublisher.listeners[secondEventName]);

		EventPublisher.off(firstEventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[secondEventName]);

		EventPublisher.off(secondEventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same eventName and scope but different listener', function() {
		const eventName = 'eventName';
		const firstListener = function() {};
		const secondListener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, firstListener, scope);
		EventPublisher.on(eventName, secondListener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, firstListener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, secondListener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, scope);

		EventPublisher.off(eventName, firstListener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, secondListener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, secondListener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('removes listeners with same eventName and listener but different scope', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const firstScope = {};
		const secondScope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, firstScope);
		EventPublisher.on(eventName, listener, secondScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 2);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, firstScope);
		assert.strictEqual(EventPublisher.listeners[eventName][1].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][1].scope, secondScope);

		EventPublisher.off(eventName, listener, firstScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, secondScope);

		EventPublisher.off(eventName, listener, secondScope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
	});

	it('does not do anything when removing listeners for unregistered eventName', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off('otherEventName', listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('does not do anything when removing listeners with unregistered listener for existent eventName', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, function() {}, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('does not do anything when removing listeners with unregistered scope for existent eventName and listener', function() {
		const eventName = 'eventName';
		const listener = function() {};
		const scope = {};

		assert.lengthOf(Object.keys(EventPublisher.listeners), 0);
		EventPublisher.on(eventName, listener, scope);

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);

		EventPublisher.off(eventName, listener, {});

		assert.lengthOf(Object.keys(EventPublisher.listeners), 1);
		assert.isDefined(EventPublisher.listeners[eventName]);
		assert.isArray(EventPublisher.listeners[eventName]);
		assert.lengthOf(EventPublisher.listeners[eventName], 1);
		assert.strictEqual(EventPublisher.listeners[eventName][0].listener, listener);
		assert.strictEqual(EventPublisher.listeners[eventName][0].scope, scope);
	});

	it('publishes to all listeners with eventName', function() {
		const eventNameA = 'eventNameA';
		const eventNameB = 'eventNameB';
		const listenerA = sinon.spy();
		const listenerB = sinon.spy();
		const listenerC = sinon.spy();
		const listenerD = sinon.spy();
		const scopeA = {};
		const scopeB = {};

		EventPublisher.on(eventNameA, listenerA, scopeA);
		EventPublisher.on(eventNameA, listenerB, scopeB);
		EventPublisher.on(eventNameB, listenerC, scopeA);
		EventPublisher.on(eventNameB, listenerD, scopeB);

		const eventA = new (class eventNameA {})();
		EventPublisher.publish(eventA);
		const eventB = new (class eventNameB {})();
		EventPublisher.publish(eventB);

		assert.isTrue(listenerA.calledOnce);
		assert.isTrue(listenerA.withArgs(eventA).calledOnce);
		assert.isTrue(listenerB.calledOnce);
		assert.isTrue(listenerB.withArgs(eventA).calledOnce);
		assert.isTrue(listenerC.calledOnce);
		assert.isTrue(listenerC.withArgs(eventB).calledOnce);
		assert.isTrue(listenerD.calledOnce);
		assert.isTrue(listenerD.withArgs(eventB).calledOnce);
	});

	it('does not do anything when publishing listeners for unregistered event', function() {
		const eventNameA = 'eventNameA';
		const listenerA = sinon.spy();
		const scopeA = {};

		EventPublisher.on(eventNameA, listenerA, scopeA);

		const eventB = new (class eventNameB {})();
		EventPublisher.publish(eventB);

		assert.isTrue(listenerA.notCalled);
	});
});
