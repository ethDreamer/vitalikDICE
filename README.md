                            VitalikDICE

Simple satoshiDICE style game written in solidity as a proof of concept.

GAME DETAILS:
    The owner of the contract will deposit funds into the contract and
    initiate a betting round.  After INIT_BLOCK_DELAY blocks pass after
    the owner calls initRound(), players can begin placing their bets
    by calling roll2x() roll5x() or roll10x().  Each of these bets has
    a probability of winning proportional to their payout with a 1.3%
    house edge.  Players can place bets until BETTING_INTERVAL blocks
    have passed.  At this point, betting is closed.  Then the owner has
    to wait ENTROPY_INTERVAL blocks until they can call distributeFunds()
    to pay out the winners.  Once the winners have been paid out the
    owner can call withdraw() to receive the funds.
 
ALGORITHM:
    The challenge comes from using random numbers on the blockchain in a
    secure way.  The source of randomness comes from both the block
    hashses and the owner's initial random seed. They are linked in such
    a way that only someone who was both the contract owner AND a miner
    with significant hashing power could manipulate the results.

    When the owner calls initRound(), they must supply the hash of a
    secret number.  This serves two purposes:
        1.  This locks the owner into using that number as part
            of the random number generation, before any bets are
            placed and resulting blocks are mined.
        2.  The number is not known to miners, so miners cannot
            manipulate the results unless they are the contract
            owner.
            
    The owner must supply the secret when they call distributeFunds().
    The random seed is calculated as follows:
    
    The secret is combined with the hash of a block within the interval
    BETTING_INTERVAL + ENTROPY_INTERVAL to generate an initial seed.
    Which block it is combined with depends on the secret.  The result
    of that combination determines whether or not another block hash in
    the same interval will be combined with the seed.  This processes
    will continue until the loop ends.  Statistically, each new block
    hash produces a 75% chance that the loop will continue.



