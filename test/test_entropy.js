const entropy = artifacts.require("entropy");

contract('entropy test', async (accounts) => {

  it("probabilties should come out right", async () => {
    let instance = await entropy.deployed();

    var p10 = 0;
    var p20 = 0;
    var p50 = 0;
    var ntests = 1000;

    for (var i = 0; i < ntests; i++) {
        let seed = await instance.testSeed(i);
        let q1 = await instance.testQ1();
        let q2 = await instance.testQ2();
        let q3 = await instance.testQ3();

        if (q1.toNumber() == 1)
            p10++;
        if (q2.toNumber() == 1)
            p20++;
        if (q3.toNumber() == 1)
            p50++;
    }

    p10 = 100*(p10/ntests);
    p20 = 100*(p20/ntests);
    p50 = 100*(p50/ntests);

    console.log("should be ~8.7: ", p10);
    console.log("should be ~18.7: ", p20);
    console.log("should be ~48.7: ", p50);

    var c10 = 0; var c20 = 0; var c50 = 0;
    if (p10 > 8 && p10 < 10)
        c10 = 1;
    if (p20 > 18 && p20 < 20)
        c20 = 1;
    if (p50 > 48 && p50 < 50)
        c50 = 1;

    assert.equal(c10, 1);
    assert.equal(c20, 1);
    assert.equal(c50, 1);
  })

})
