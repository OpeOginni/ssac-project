// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SSACTOKEN is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("SSAC TOKEN", "SAC") {
        _mint(msg.sender, 100 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        _approve(to, msg.sender, amount);
    }

    // Only the owner should be able to call burn
    // function burnFrom(address from, uint256 amount) public override {
    //     burnFrom(from, amount);
    // }
}
