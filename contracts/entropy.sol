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
    * Everything after this point is testing code for the testing
    * framwork to check that the probabilities are comming out right
    ***************/

    /* gotta have that house edge of 1.3% */
    uint private constant Q1            = 87  * TENTH_PERCENT;
    uint private constant Q2            = 187 * TENTH_PERCENT;
    uint private constant Q3            = 487 * TENTH_PERCENT;

    function testSeed(uint secret) public isOwner view returns (uint) {
        uint behind = 64;
        uint interval = 32;
        uint current = block.number;
        uint seed = getSeed(secret, current - behind, current - behind + interval);

        byte ret = 0x0;
        if (seed <= Q1)
            ret |= 0x1;
        if (seed <= Q2)
            ret |= 0x2;
        if (seed <= Q3)
            ret |= 0x4;

        return uint(ret);
    }

    function byteToChar (bytes1 _b) private pure returns (byte) {
		uint _r;
		if (uint(_b) > 9) {
			_r = 55;
		}
		else {
			_r = 48;
		}
		_r = _r + uint(_b);
		return bytes1(_r);
    }

	function getHex(bytes32 byteData) public pure returns (string) {
        bytes memory hexData  = new bytes(66);
        hexData[0] = '0';
        hexData[1] = 'x';

        for (uint j=0; j<32; j++) {
            byte b = byteData[j];
            byte half1 = b >> 4;
            byte half2 = b & 0xF;

			hexData[2*j+2] = byteToChar(half1);
			hexData[2*j+3] = byteToChar(half2);

        }
		return string(hexData);
	}

	function doubleHash(uint data) external pure returns(string) {
		bytes32 x = keccak256(keccak256(bytes32(data)));
		return getHex(x);
	}

	function getHexUint(uint data) public pure returns(string) {
		return getHex(bytes32(data));
	}
}

