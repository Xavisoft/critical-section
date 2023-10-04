
const Queue = require('queue-fifo');
const { LOCK_FACTORY_MODES } = require("./constants");
const Lock = require('./Lock');

const KEY_JOINER = "__";

class LockFactory {

   /**
    * 
    * @param  {...string} keys 
    * @returns 
    */
   async acquire(...keys) {
      // merge into one key
      keys.sort(); // so that different order always produce the same key

      const locks = [];
      
      for (let i in keys) {
         const key = keys[i];
         const lock = await this._acquire(key);
         locks.push(lock);
      }

      return new Lock(null, locks);
      
   }

   _acquire(key) {

      return new Promise((resolve, reject) => {
         // process queue
         const queue = this._getQueue(key);
         const queueWasEmpty = queue.isEmpty();

         const lock = new Lock(queue);
         queue.enqueue({ lock, resolve });

         if (queueWasEmpty)
            return resolve(lock);

      });
   }

   /**
    * 
    * @param {String} key 
    * @returns {Queue}
    */
   _getQueue(key) {
      let queue = this._queues.get(key);

      if (!queue) {
         queue = new Queue();
         this._queues.set(key, queue);
      }

      return queue;

   }

   constructor(mode=LOCK_FACTORY_MODES.SIMPLE) {
      this._mode = mode;
      this._queues = new Map();
   }
}

module.exports = LockFactory;