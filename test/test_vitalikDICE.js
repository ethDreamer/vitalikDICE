var lib = require("./libTest.js");
var vitalikDICE = artifacts.require("./vitalikDICE.sol");
var entropy     = artifacts.require("./entropy.sol");

contract('vitalikDICE.sol', function(accounts) {
    var ownerAddress = accounts[0];
    var firstAddress = accounts[1];
    var secondAddress = accounts[2];
    var thirdAddress = accounts[3];
    var fourthAddress = accounts[4];

    var bet2x       = 1e18;         // 1.00 ether
    var account2x   = accounts[5];
    var bet5x       = 1e17;         // 0.10 ether
    var account5x   = accounts[6];
    var bet10x      = 1e16;         // 0.01 ether
    var account10x = accounts[7];

    /* throw in an extra 2x bet to test array */
    var extra2xbet  = 1e18;
    var extra2xacc  = accounts[8];
    var extra2xbal;

    var secret = Math.floor(Math.random()*1000 + 10);
    var secretTest = 'testing initRound() with keccak256(keccak256(' + secret + '))';
    var bal2x; var bal5x; var bal10x;

    var winString = 'bet won, account should be credited';
    var loseString = 'bet lost, account should not be credited';
    var win10x = false; var win5x = false; var win2x = false;
    var string10 = 'roll 10x'; var string5 = 'roll 5x'; var string2 = 'roll 2x';

    it('bettingOpen() should return false before any call to initRound()', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return lib.blockChain.exec(vitInstance.bettingOpen);
        })
        .then(function(result) {
            assert(!result, "bettingOpen() did not return false");
        })
    });

    it('deposit() should fail when not called from owner address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.deposit({from:secondAddress, value:1e19});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('deposit() should work when called from owner address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.deposit({from:ownerAddress, value:1e19});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('roll2x() should revert when betting is not open', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll2x({value:1e17});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('roll5x() should revert when betting is not open', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll5x({value:1e17});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('roll10x() should revert when betting is not open', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll10x({value:1e17});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('withdraw() should fail when not called from owner address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.withdraw(1e16, {from:secondAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('withdraw() should work from owner address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.withdraw(1e15, {from:ownerAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was reverted.");
        });
    });

    it('initRound() should fail when not called from owner address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.initRound('0x16DB2E4B9F8DC120DE98F8491964203BA76DE27B27B29C2D25F85A325CD37477', {from:secondAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it(secretTest, function() {
        var entInstance;
        var secretHash;
        return entropy.deployed()
        .then(function(instance) {
            entInstance = instance;
            /* calculate doulbe hash of secret */
            return entInstance.doubleHash(secret);
        })
        .then(function(hash) {
            secretHash = hash;
            return vitalikDICE.deployed()
        })
        .then(function(instance) {
            return instance.initRound(secretHash);
        })
        .then(function(result) {
            assert(true);
        })
        .catch(function(error) {
            console.log("error: ", error.message);
        });
    });

    it('withdraw() should fail when winners haven\'t been paid', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.withdraw(1e16, {from:ownerAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('bettingOpen() should return false before INIT_BLOCK_DELAY blocks have passed', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.bettingOpen.call();
        })
        .then(function(result) {
            assert(!result, "bettingOpen() did not return false");
            return vitInstance.bettingOpen();
        })
    });

    it('bettingOpen() should return true now that a few block have passed', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            /* let two blocks pass */
            vitalikDICE.new();
            vitalikDICE.new();
        })
        .then(function() {
            return vitInstance.bettingOpen();
        })
        .then(function(result) {
            assert(result, "bettingOpen() returned false");
        })
    });

    it('roll2x() should revert when transaction below limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll2x({from:firstAddress, value:9e15});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll5x() should revert when transaction below limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll5x({from:firstAddress, value:9e15});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll10x() should revert when transaction below limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll10x({from:firstAddress, value:9e15});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll2x() should work when transaction above limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll2x({from:account2x, value:bet2x});
        })
        .then(function() {
            return vitInstance.roll2x({from:extra2xacc, value:extra2xbet});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll5x() should work when transaction above limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            bal2x = web3.eth.getBalance(account2x).toNumber();
            extra2xbal = web3.eth.getBalance(extra2xacc).toNumber();
            return vitInstance.roll5x({from:account5x, value:bet5x});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll10x() should work when transaction above limit', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll10x({from:account10x, value:bet10x});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll2x() should revert when liabilites greater than we can cover', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.roll2x({from:firstAddress, value:1e19});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll5x() should revert when liabilites greater than we can cover', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            bal5x = web3.eth.getBalance(account5x).toNumber();
            return vitInstance.roll5x({from:firstAddress, value:1e19});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('roll10x() should revert when liabilites greater than we can cover', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            bal10x = web3.eth.getBalance(account10x).toNumber();
            return vitInstance.roll10x({from:firstAddress, value:1e19});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('distributeFunds() should not be callable before betting over', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.distributeFunds(secret);
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('distributeFunds() should not be callable from an external address', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            /* let 64 blocks pass */
            for (var i = 1; i < 64; i++) {
                entropy.new();
            }
            return entropy.new();
        })
        .then(function() {
            return vitInstance.distributeFunds(secret, {from:secondAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('distributeFunds() should not be callable with the wrong secret', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.distributeFunds(5);
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });

    it('distributeFunds() should be callable with the correct secret', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.distributeFunds(secret);
        })
        .then(function(result) {
            var bet = result.logs[0].args;
            win10x = bet.roll10x;
            win5x  = bet.roll5x;
            win2x  = bet.roll2x;
//            console.log(result.logs[0].args);
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was reverted.");
        });
    });

    it('checking 10x account balances', function() {
        var balance = bet10x * 10 + bal10x;
        if (win10x) {
            assert.equal(web3.eth.getBalance(account10x).toNumber(), balance, '10x accounts not paid despte win');
        }
        else {
            assert.equal(web3.eth.getBalance(account10x).toNumber(), bal10x, '10x accounts paid despite loss');
        }
    });
    it('checking 5x account balances', function() {
        var balance = bet5x * 5 + bal5x;
        if (win5x) {
            assert.equal(web3.eth.getBalance(account5x).toNumber(), balance, '5x accounts not paid despite win');
        }
        else {
            assert.equal(web3.eth.getBalance(account5x).toNumber(), bal5x, '5x accounts paid despite loss');
        }
    });
    it('checking 2x account balances', function() {
        var balance = bet2x * 2 + bal2x;
        var extra   = extra2xbet * 2 + extra2xbal;
        if (win2x) {
            assert.equal(web3.eth.getBalance(account2x).toNumber(), balance, '2x accounts not paid despite win');
            assert.equal(web3.eth.getBalance(extra2xacc).toNumber(), extra,  '2x accounts not paid despite win');
        }
        else {
            assert.equal(web3.eth.getBalance(account2x).toNumber(), bal2x, '2x accounts were paid despite loss');
            assert.equal(web3.eth.getBalance(extra2xacc).toNumber(), extra2xbal, '2x accounts were paid despite loss');
        }
    });
    it('distributeFunds() should not be callable twice', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;
            return vitInstance.distributeFunds(secret);
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.notEqual(error.message, "assert.fail()", "Transaction was not reverted.");
        });
    });
    it('withdraw() should work after paying winners', function() {
        return vitalikDICE.deployed()
        .then(function(instance) {
            return instance.withdraw(6e18, {from:ownerAddress});
        })
        .then(function(result) {
            assert.fail();
        })
        .catch(function(error) {
            assert.equal(error.message, "assert.fail()", "Transaction was reverted.");
        });
    });

});

/*
    it('bettingOpen() should return false before any call to initRound()', function() {
        var vitInstance;
        return vitalikDICE.deployed()
        .then(function(instance) {
            vitInstance = instance;

        })
    });

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

*/
