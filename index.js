

'use strict';

const CriticalSection = require('./CriticalSection');
const cluster = require('cluster');
const { requestLockFromMasterCluster, releaseLockOnCluster } = require('./utils');


function oneCoreCriticalSectionGenerator(key) {
	return CriticalSection.getCriticalSection(key);
}

function workerClusterCriticalSectionGenerator(key) {

	return {
		key,
		acquireLock: function() {
			return requestLockFromClusterMaster(this.key);
		},
		releaseLock: function() {
			return releaseLockOnCluster(this.key);
		}
	}
}

class OneCoreLock {


	static async getLock(...keys) {

		keys = keys.sort(); // avoid deadlocks

		const criticalSections = [];
		for (let i in keys) {
			criticalSections.push(await CriticalSection.getCriticalSection(keys[i]));
		}

		return new OneCoreLock(...criticalSections);

	}

	release() {
		for (let i in this.criticalSections) {
			this.criticalSections[i].releaseLock();
		}
	}

	constructor(...criticalSections) {
		this.criticalSections = criticalSections;
	}
}




let initialized;

function init(options={}) {

	if (initialized)
		return initialized;

	const {
		mode="1_CORE",
	} = options;

	switch (mode) {
		case '1_CORE':
			initialized = OneCoreLock;
			break;
		case 'LOCAL_CLUSTER_CLIENT':

			if (cluster.isMaster)
				throw new Error('Process is not a fork.');

			initialized = workerClusterCriticalSectionGenerator;
			break;

		case 'LOCAL_CLUSTER_SERVER':
			break;
		case 'REMOTE_CLUSTER_CLIENT':
			break;
		case 'REMOTE_CLUSTER_SERVER':
			break;
		default:
			throw new Error('Invalid mode.');
	}


	return initialized;

}

module.exports = {
	init
}
