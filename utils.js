
const cluster = require('cluster');
const { v4: uuid } = require('uuid');

const CRITICAL_SECTION_MESSAGE_TOKEN = '1FGVZCAXAXXQX/BQVQVVQCXDDZDDDXZCVBJHGFS';


function requestLockFromClusterMaster(key) {

	return new Promise(resolve => {
		const request_id = uuid();

		const message = {
			token: CRITICAL_SECTION_MESSAGE_TOKEN,
			key,
			request_id,
			action: 'acquire'
		}

		process.once(`lock-acquired-${request_id}`, resolve);
		process.send(JSON.stringify(message));

	});
}

function releaseLockOnCluster(key) {


	return new Promise(resolve => {
		const request_id = uuid();

		const message = {
			token: CRITICAL_SECTION_MESSAGE_TOKEN,
			key,
			request_id,
			action: 'release'
		}

		process.once(`lock-acquired-${request_id}`, resolve);
		process.send(JSON.stringify(message));

	});

}


function processOnMessageHandler(message) {
	message = JSON.parse(message);
	const { request_id, token } = message;
	process.emit(`lock-acquired-${request_id}`);
}


module.exports = {
	requestLockFromClusterMaster,
	processOnMessageHandler,
	releaseLockOnCluster
}