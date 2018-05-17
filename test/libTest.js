
/*******************************************************
 *  There's no way to call a function that modifies the
 *  state of the blockchain AND get the return value of
 *  that function without using events. You shouldn't
 *  have to modify your contract code to emit a bunch of
 *  useless event information (which costs gas and
 *  pollutes the blockchain) just so that you can run a
 *  unit test.
 *
 *  function.call()
 *      this gets the return value of the function but
 *      doesn't modify the state of the blockchain
 *  function()
 *      this actually creates a transaction that modifies
 *      the blockchain but doesn't get the return value
 *
 *  the solution is to use both of them
 *******************************************************/
function exec(testFunc, ...args) {
    var ret;
    if (args.length == 0) {
        ret = testFunc.call();
        testFunc();
    }
    else {
        ret = testFunc.call.apply(null, args);
        testFunc.apply(null, args);
    }
    return ret;
}

exports.blockChain = {
    exec:   exec
}

