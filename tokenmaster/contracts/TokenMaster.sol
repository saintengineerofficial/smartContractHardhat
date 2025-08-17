// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721{
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;

    mapping(uint256 => Occasion) occasions;
    // occasionId => seatId => owner,用户订购了某一场表演的座位
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    // occasionId => seatId[],某一场表演已经被订购的座位
    mapping(uint256 => uint256[]) public seatsTaken;
    // occasionId => address => bool,用户是否已经购买了某一场表演
    mapping(uint256 => mapping(address=>bool)) public hasBought;
    struct Occasion{
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    modifier onlyOwner(){
        require(msg.sender == owner,"Only owner can call this function");
        _;
    }

    constructor(string memory _name,string memory _symbol) ERC721(_name,_symbol){
        owner = msg.sender;
    }

    function list(
    string memory _name,
    uint256 _cost,
    uint256 _maxTickets,
    string memory _date,
    string memory _time,
    string memory _location) 
    public onlyOwner{
        totalOccasions++;
        occasions[totalOccasions] = Occasion(totalOccasions,_name,_cost,_maxTickets,_maxTickets,_date,_time,_location);
    }

    function mint(uint256 _id,uint256 _seatId) payable public {

        require(_id!=0,"Invalid occasion id");
        require(_id <= totalOccasions,"Invalid occasion id");
        require(msg.value >= occasions[_id].cost,"Invalid amount");

        require(seatTaken[_id][_seatId] == address(0),"Seat already taken");
        require(seatsTaken[_id].length < occasions[_id].maxTickets,"No more tickets available");

        occasions[_id].tickets = occasions[_id].tickets - 1; // 票数减少
        hasBought[_id][msg.sender] = true; 
        seatTaken[_id][_seatId] = msg.sender; // 记录用户订购的座位
        seatsTaken[_id].push(_seatId); // 记录已经订购的座位

        totalSupply++; // 
        _safeMint(msg.sender,totalSupply);
    }

    function getOccasion(uint256 _id) public view returns(Occasion memory)  {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns(uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdrawFunds() public onlyOwner{
        (bool success,) = payable(msg.sender).call{value:address(this).balance}("");
        require(success,"Withdraw failed");
    }
}
