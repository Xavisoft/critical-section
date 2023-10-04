

class Lock {

   release() {

      if (this._queue) {

         const queue = this._queue;
         queue.dequeue();

         const item = queue.peek();

         if (item) {
            const { resolve, lock } = item;
            resolve(lock);
         }
      } else if (this._locks) {
         const locks = this._locks;

         for (let i in locks) {
            const lock = locks[i];
            lock.release();
         }
      }
   }

   /**
    * 
    * @param {import("queue-fifo")} queue
    * @param {Array<Lock>} locks 
    */
   constructor(queue, locks) {
      this._queue = queue;
      this._locks = locks;
   }
}

module.exports = Lock;