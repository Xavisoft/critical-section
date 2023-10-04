
const casual = require('casual');
const { assert } = require('chai');
const { LockFactory } = require('..');

suite("Tests", function() {

   suite("One core", function() {
      test("Should block program until all other locks are released", async () => {

         // add lock
         let prevLockReleased = false;
         const lockFactory = new LockFactory();
         const lockName = casual.word;

         {
            const lock = await lockFactory.acquire(lockName);

            setTimeout(() => {
               prevLockReleased = true;
               lock.release();
            }, casual.integer(100, 1000));
         }

         await lockFactory.acquire(lockName);
         assert.isTrue(prevLockReleased);
         
      });

      test("Should block lock request to one key if part of an unrealeased lock", async () => {

         // add lock
         let prevLockReleased = false;
         const lockFactory = new LockFactory();
         const lockName = casual.word;

         {
            const lock = await lockFactory.acquire(casual.word, lockName, casual.word);

            setTimeout(() => {
               prevLockReleased = true;
               lock.release();
            }, casual.integer(100, 1000));
         }

         await lockFactory.acquire(lockName);
         assert.isTrue(prevLockReleased);
         
      });
   });
});