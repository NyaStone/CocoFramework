import {Promise as BluebirdPromise} from "bluebird";
import sleep from "system-sleep";


function syncUp(...promises:Promise<unknown>[]):unknown[] {
    if (promises.length == 0) return [];

    // bundeling all promisses into a single bluebird promise
    const promiseToResolve = BluebirdPromise.all(promises);
    // looping while the promise is pending
    while (promiseToResolve.isPending()) { sleep(500); /* do nothing and block execution untill promise is resolved*/}
    // checking on the status of the promise
    if (promiseToResolve.isRejected()) throw promiseToResolve.reason();
    if (promiseToResolve.isCancelled()) throw new Error('Awaited promise has been canceled');

    if (!promiseToResolve.isFulfilled()) throw new Error('Unexpected Promise state');
    const awaitedValues = promiseToResolve.value();
    // console.log(`awaited values : ${awaitedValues}`);
    return awaitedValues;
}

export {syncUp};
