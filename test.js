
// const { init } = require('.');

// console.clear();

// function randomInteger() {
// 	return parseInt(Math.random() * 2000)
// }

// function delay(millis) {
// 	return new Promise(resolve => setTimeout(resolve, millis));
// }


// const getCriticalSection = init();


// for (let i = 0; i < 100; i++) {
// 	setTimeout((async () => {
// 		const cs = getCriticalSection('lock');
// 		const time = Date.now();
// 		await cs.acquireLock();
// 		await delay(randomInteger());
// 		console.log(`Iteration ${i}: found lock after ${Date.now() - time}ms`);
// 		cs.releaseLock();
// 	}), 1000);
// 	// console.log(i);
// }


const cluster = require('cluster');

if (cluster.isMaster) {

	cluster.fork();
	cluster.fork();

	cluster.on('message', function(worker, message) {
		console.log('Worker said:', message);
		worker.send(message.split('').join('<-'));
	});
} else {
	process.send('Hey master');
	process.on('message', message => {
		console.log('Master said: ', message);
	})
}