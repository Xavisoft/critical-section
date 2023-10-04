

const Queue = require('queue-fifo');

class CriticalSection {

	queue = new Queue();
	lockWaitingResolve = () => {};

	static instances = new Map();

	releaseLock() {
		if (this.lockWaitingResolve) {
			this.lockWaitingResolve();
			this.lockWaitingResolve = null;
		} else {
			throw new Error('No lock available to release');
		}
	}


	waitForLockRelease() {

		const { event } = this;

		return new Promise(resolve => {
			this.lockWaitingResolve = resolve;
		});

	}


	static removeCriticalSection(key) {
		this.instances.delete(key);
	}

	static getCriticalSection(key) {
		return this.instances.get(key) || new this(key);
	}

	static addCriticalSection(key, instance) {
		this.instances.set(key, instance);
	}


	async processQueue() {

		const { queue } = this;

		if (queue.isEmpty()) {

			return;
		}

		const resolve = queue.peek();
		resolve();
		await this.waitForLockRelease();
		queue.dequeue();

		this.processQueue();

	}

	acquireLock(resolve) {

		const { queue } = this;
		const wasEmpty = queue.isEmpty();

		return new Promise(resolve => {
			queue.enqueue(resolve);
			if (wasEmpty)
				this.processQueue();
		});

	}

	constructor(key) {
		// this.key = key;
		this.constructor.addCriticalSection(key, this);
	}
}

module.exports = CriticalSection;