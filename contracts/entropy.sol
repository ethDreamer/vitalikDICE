pragma solidity ^0.4.0;

contract entropy {
    uint private constant MAX_UINT = 2**256 - 1;
    uint private constant TENTH_PERCENT = MAX_UINT / 1000;
    /* 75 percent chance of adding another block's hash to the seed */
    bytes32 private constant CONTINUE   = bytes32(750 * TENTH_PERCENT);
    address private owner_;

    modifier isOwner {
        assert(owner_ == msg.sender);
        _;
    }

    constructor() public {
        owner_ = msg.sender;
    }

    function getSeed(uint secret, uint start_block, uint end_block) public view isOwner returns(uint) {
        uint blockId    = start_block;
        uint oldBlockId = 0;
        secret          = uint(keccak256(secret));
        bytes32 seed    = bytes32(secret);

        blockId        += (secret % (end_block - start_block));
        /***********
        *   Gotta hash the hash because the block hashes are constrained to meet the
        *   difficulty critera so you won't get a random sample of the bitspace
        *   by using the regular block hashses
        ************/
        bytes32 blockHash   = keccak256(blockhash(blockId));
        seed                = seed ^ blockHash;
        uint count          = 1;
        /***********
        *   Continuously XOR the seed with keccak256sums of teh block hashses.  Each round_
        *   produces a 75% chance that we will continue iterating and pick another blocks
        *   to XOR together. The loop stops if we pick the same block as the last time or
        *   when we've looped more than (secret % 13) times. This provides protection against
        *   using too much gas while also making it very difficult to try and calculate
        *   probability distributions of the resulting seed without knowing the secret.
        ************/
        while (blockHash <= CONTINUE && blockId != oldBlockId && count < (secret % 13)) {
            oldBlockId  = blockId;
            blockId     = ((blockId + uint(blockHash)) % (end_block - start_block)) + start_block;
            blockHash   = keccak256(blockhash(blockId));
            seed        = seed ^ blockHash;
            count++;
        }

        uint useed = uint(seed);
        return useed;
    }

    /***************
    * Everything after this point is testing code for the testing framwork to check
    * that the probabilities are comming out right
    ***************/

    /* gotta have that house edge of 1.3% */
    uint private constant Q1            = 87  * TENTH_PERCENT;
    uint private constant Q2            = 187 * TENTH_PERCENT;
    uint private constant Q3            = 487 * TENTH_PERCENT;
    uint private lastSeed_;
    function testSeed(uint secret) public isOwner returns (uint) {
        uint behind = 64;
        uint interval = 32;
        uint current = block.number;
        uint seed = getSeed(secret, current - behind, current - behind + interval);
        lastSeed_ = seed;
        return seed;
    }

    function testQ1() public view isOwner returns(uint) {
        if (lastSeed_ <= Q1)
            return 1;
        return 0;
    }
    function testQ2() public view isOwner returns(uint) {
        if (lastSeed_ <= Q2)
            return 1;
        return 0;
    }
    function testQ3() public view isOwner returns(uint) {
        if (lastSeed_ <= Q3)
            return 1;
        return 0;
    }
}
