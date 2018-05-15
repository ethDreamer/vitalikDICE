pragma solidity ^0.4.0;
import "contracts/roller.sol";
import "contracts/entropy.sol";
import "contracts/addrStack.sol";
//import "github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol";
import "contracts/SafeMath.sol";

contract vitalikDice is roller {
    using SafeMath for uint;

    /* Launcher of contract */
    address private owner_;
    /*************
    *   INIT_BLOCK_DELAY:
    *       Number of blocks to wait between initializing
    *       a new betting round and opening up betting
    *   BETTING_INTERVAL:
    *       Number of blocks in a betting period
    *   ENTROPY_INTERVAL:
    *       Number of blocks after betting period to gather entropy
    *       before winners can be decided
    *   MINIMUM_BET:
    *       Minimum ether to place a bet
    **************/
    uint private constant INIT_BLOCK_DELAY = 2;
    uint private constant BETTING_INTERVAL = 16;
    uint private constant ENTROPY_INTERVAL = 16;
    uint private constant MINIMUM_BET      = 0.01 ether;
    /* odds for winning have a house edge of 1.3% */
    uint private constant MAX_UINT      = 2**256 - 1;
    uint private constant TENTH_PERCENT = MAX_UINT / 1000;
    uint private constant WIN10X        = 87  * TENTH_PERCENT;
    uint private constant WIN5X         = 187 * TENTH_PERCENT;
    uint private constant WIN2X         = 487 * TENTH_PERCENT;

    struct betRound {
        uint initBlock;             /* block height of this betting round */
        uint liabilities;           /* total liabilities if all betters win */
        uint256 secretHash;         /* keeps us honest by committing us to random seed */
        bool winnersPaid;           /* winners have been paid */
        addrStack roll2players;     /* array of roll 2 players */
        addrStack roll5players;     /* array of roll 5 players */
        addrStack roll10players;    /* array of roll 10 players */
    }
    betRound round_;
    entropy private pool_;

    constructor() public {
        owner_ = msg.sender;
        round_.roll2players  = new addrStack();
        round_.roll5players  = new addrStack();
        round_.roll10players = new addrStack();
        pool_ = new entropy();
    }

    /* Are we in the betting period now? */
    function bettingOpen() public view returns(bool) {
        return (
            (round_.initBlock > 0) &&
            (block.number >= round_.initBlock + INIT_BLOCK_DELAY) &&
            (block.number <= round_.initBlock + INIT_BLOCK_DELAY + BETTING_INTERVAL)
        );
    }

    modifier isOwner {
        assert(msg.sender == owner_);
        _;
    }

    modifier validBet {
        /* revert if betting is not open */
        if (!(bettingOpen()))
            revert();
        /* revert if minimum bet not met */
        if (msg.value < MINIMUM_BET)
            revert();
        _;
    }

    /*******************
    *   Contract owner_ initializes a new betting round
    *   To do this the owner picks a secret random number
    *   and hashes it twice through keccak256sum (off the
    *   blockchain) and passes that to this function. When
    *   the winners are decided the original secret is passed
    *   to the distributeFunds() function and the double hashed
    *   value of the secret is then checked against the stored
    *   hash from the beginning ensuring the owner_ cannot
    *   manipulate the random starting seed in an effort to
    *   skew the results of the bets.
    ********************/
    function initRound(uint secretHash)
        external
        isOwner
        returns(bool) {
        /* can't start a new round if betting still open */
        if (bettingOpen())
            revert();
        /* winners from previous round must be paid */
        if (!round_.winnersPaid)
            revert();

        /* clear old data */
        round_.liabilities = 0;
        round_.roll2players.clear();
        round_.roll5players.clear();
        round_.roll10players.clear();
        round_.winnersPaid = false;
        /* new round data */
        round_.initBlock  = block.number;
        round_.secretHash = secretHash;
    }

    function distributeFunds(uint secret)
        external
        isOwner {
        /* initRound has been called before */
        if (round_.initBlock == 0)
            revert();
        /* don't want to redistribute funds */
        if (round_.winnersPaid)
            revert();
        /* have to wait until betting and entropy gathering are done */
        if (block.number <= round_.initBlock + INIT_BLOCK_DELAY + BETTING_INTERVAL + ENTROPY_INTERVAL)
            revert();
        /* gotta check that random seed */
        if (keccak256(keccak256(secret)) != bytes32(round_.secretHash))
            revert();

        /* calculate the pseudorandom seed */
        uint seed = pool_.getSeed(secret, (round_.initBlock + INIT_BLOCK_DELAY), (round_.initBlock + INIT_BLOCK_DELAY + BETTING_INTERVAL + ENTROPY_INTERVAL));

        uint size; address addr; uint winnings; uint i;
        if (seed <= WIN10X) {
            size = round_.roll10players.size();
            for (i = 0; i < size; i++) {
                (addr, winnings) = round_.roll10players.at(i);
                winnings = winnings.mul(10);
                addr.transfer(winnings);
            }
        }
        if (seed <= WIN5X) {
            size = round_.roll5players.size();
            for (i = 0; i < size; i++) {
                (addr, winnings) = round_.roll5players.at(i);
                winnings = winnings.mul(5);
                addr.transfer(winnings);
            }
        }
        if (seed <= WIN2X) {
            size = round_.roll2players.size();
            for (i = 0; i < size; i++) {
                (addr, winnings) = round_.roll2players.at(i);
                winnings = winnings.mul(2);
                addr.transfer(winnings);
            }
        }

        /* clear players for the next round */
        round_.roll10players.clear();
        round_.roll5players.clear();
        round_.roll2players.clear();

        round_.winnersPaid = true;
    }

    /* roll2x functionality */
    function roll2x() payable external { // validBet {
        round_.liabilities = round_.liabilities.add(msg.value.mul(2));
        /* can't place a bet we can't pay out */
        if (round_.liabilities >= address(this).balance)
            revert();
        round_.roll2players.push(msg.sender, msg.value);
    }
    /* roll5x functionality */
    function roll5x() payable external { // validBet {
        round_.liabilities = round_.liabilities.add(msg.value.mul(5));
        /* can't place a bet we can't pay out */
        if (round_.liabilities >= address(this).balance)
            revert();
        round_.roll5players.push(msg.sender, msg.value);
    }
    /* roll10x functionality */
    function roll10x() payable external { // validBet {
        round_.liabilities = round_.liabilities.add(msg.value.mul(10));
        /* can't place a bet we can't pay out */
        if (round_.liabilities >= address(this).balance)
            revert();
        round_.roll10players.push(msg.sender, msg.value);
    }
}
