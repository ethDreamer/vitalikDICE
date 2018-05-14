pragma solidity ^0.4.0;

contract addrStack {
    uint      private size_;        /* number of addresses stored */
    address[] private stack_;       /* array of addresses */
    uint[]    private balance_;     /* balance of addresses */
    address   private owner_;       /* contract owner */

    constructor() public {
        owner_      = msg.sender;
        size_       = 0;
        stack_      = new address[](8);
        balance_    = new uint[](8);
    }

    modifier isOwner {
        assert(msg.sender == owner_);
        _;
    }

    function push(address addr, uint balance) public isOwner returns(uint) {
        if (size_ < stack_.length) {
            stack_[size_]   = addr;
            balance_[size_] = balance;
        }
        else {
            stack_.push(addr);
            balance_.push(balance);
        }
        size_++;
        return (size_);
    }

    function size() external isOwner view returns(uint) {
        return size_;
    }

    function at(uint x) external isOwner view returns(address, uint) {
        assert(x < size_);
        return(stack_[x], balance_[x]);
    }

    function clear() external isOwner {
        size_ = 0;
    }
}
