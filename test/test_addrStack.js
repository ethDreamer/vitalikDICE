var lib = require("./libTest.js");
var addrStack = artifacts.require("./addrStack.sol");

contract('addrStack.sol', (accounts) => {
    var ownerAddress = accounts[0];
    var firstAddress = accounts[1];
    var secondAddress = accounts[2];
    var thirdAddress = accounts[3];

    it('push() and size() functions should work correctly', function() {
        var addrInstance;
        return addrStack.deployed()
        .then(function(instance) {
            addrInstance = instance;
            lib.blockChain.exec(addrInstance.push, firstAddress, 1);
            return lib.blockChain.exec(addrInstance.push, secondAddress, 2);
        })
        .then(function(pushResult) {
            assert.equal(pushResult.toNumber(), 2, "push() return value after pushing 2 addresses should be 2\n");
            lib.blockChain.exec(addrInstance.push, thirdAddress, 3);
            return lib.blockChain.exec(addrInstance.size);
        })
        .then(function(sizeResult) {
            assert.equal(sizeResult.toNumber(), 3, "size() return value after pushing 3 addresses should be 3\n");
            return lib.blockChain.exec(addrInstance.push, ownerAddress, 5);
        })
        .then(function(pushResult) {
            assert.equal(pushResult.toNumber(), 4, "push() return value after pushing 4 addresses should be 4\n");
        })
    });

    it('at() functions should work correctly', function() {
        var addrInstance;
        return addrStack.deployed()
        .then(function(instance) {
            addrInstance = instance;
            return addrInstance.at.call(1);
        })
        .then(function(atResult) {
            assert.equal(atResult[0], secondAddress,   "did not recall secondAddress (2nd element)\n");
            assert.equal(atResult[1].toNumber(), 2,    "did not recall second address balance\n");
            return addrInstance.at.call(3);
        })
        .then(function(atResult) {
            assert.equal(atResult[0], ownerAddress,    "did not recall ownerAddress (4th element)\n");
            assert.equal(atResult[1].toNumber(), 5,    "did not recall ownerAddress balance\n");
        })
    });

    it('clear() function should work correctly', function() {
        var addrInstance;
        return addrStack.deployed()
        .then(function(instance) {
            addrInstance = instance;
            return lib.blockChain.exec(addrInstance.size);
        })
        .then(function(sizeResult) {
            assert.equal(sizeResult.toNumber(), 4, "size() should return 4 since we've added 4 elements\n");
            lib.blockChain.exec(addrInstance.clear);
            return lib.blockChain.exec(addrInstance.size);
        })
        .then(function(sizeResult) {
            assert.equal(sizeResult.toNumber(), 0, "size() return value after calling clear() should be zero\n");
        })
    });

    it('calling at() with out of bounds index should fail', function() {
        return addrStack.deployed()
        .then(function(instance) {
            addrInstance = instance;
            return addrInstance.at(0);
        })
        .then(function(atReturn) {
            assert.fail();
        })
        .catch(error => {
            assert.notEqual(error.message, "assert.fail()", "Transaction when out of bounds index 0 called");
        });
    });

    it('should revert the transaction when an invalid address calls push()', function() {
    return addrStack.deployed()
        .then(function(instance) {
            return instance.push(firstAddress, 2.0, {from:firstAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted with an invalid address");
        });
    });

    it('should revert the transaction when an invalid address calls size()', function() {
    return addrStack.deployed()
        .then(function(instance) {
            return instance.size({from:firstAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted with an invalid address");
        });
    });

    it('should revert the transaction when an invalid address calls at()', function() {
    return addrStack.deployed()
        .then(function(instance) {
            instance.push(firstAddress, 2);
            return instance.at(0, {from:firstAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted with an invalid address");
        });
    });

    it('should revert the transaction when an invalid address calls clear()', function() {
    return addrStack.deployed()
        .then(function(instance) {
            return instance.clear({from:firstAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted with an invalid address");
        });
    });

});
