const entropy = artifacts.require("entropy");

contract('entropy.sol   [this test takes ~1 minute to check probabilities]', function(accounts) {

    it("probabilities should come out right", function() {
        var p10 = 0;
        var p20 = 0;
        var p50 = 0;
        var ntests = 4000;
        var tcount = 0;

        function seedCall(instance, i) {
            return instance.testSeed.call(i)
            .then(function(result) {
                var qs = result.toNumber();
                if ((qs & 1) == 1) {
                    p10++;
                }
                if ((qs & 2) == 2) {
                    p20++;
                }
                if ((qs & 4) == 4) {
                    p50++;
                }
                tcount++;
            });
        }

        return entropy.deployed().then(function(instance) {
            // launch all but one in this loop
            for (var i = 1; i < ntests; i++) {
                seedCall(instance, i);
            }

            return seedCall(instance, 0);
        })
        .then(function() {
            p10 = 100*(p10/ntests);
            p20 = 100*(p20/ntests);
            p50 = 100*(p50/ntests);

            console.log("should be ~8.7:  ", p10);
            console.log("should be ~18.7: ", p20);
            console.log("should be ~48.7: ", p50);

            var c10 = 0; var c20 = 0; var c50 = 0;
            if (p10 > 8 && p10 < 10)
                c10 = 1;
            if (p20 > 18 && p20 < 20)
                c20 = 1;
            if (p50 > 48 && p50 < 50)
                c50 = 1;

            assert.equal(c10, 1, "10x probability out of range");
            assert.equal(c20, 1, "5x  probability out of range");
            assert.equal(c50, 1, "2x  probability out of range");
        });
    });
});

