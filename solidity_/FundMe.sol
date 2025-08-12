// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.创建一个收款函数
// 2.记录投资人并且查看
// 3.在锁定期内，达到目标值，生产商可以提款
// 4.在锁定期内，没有达到目标值，投资人在锁定期以后退款

contract FundMe {
    mapping(address => uint256) public fundersToAmount;
    uint256 constant MINIMUN_VALUE = 1 * 10**18; //USD

    // 合约也可以作为类型AggregatorV3Interface
    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 1000 * 10**18;

    address public owner;

    // 锁定期，部署时间开始+锁定时间=结束时间
    uint256 deploymentTimeStamp;
    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        owner = msg.sender;
        deploymentTimeStamp = block.timestamp; //当前区块部署时间
        lockTime = _lockTime; //锁定时间，到期以后退款
    }

    // 通过预言机获取eth汇率
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    // 收款
    function fund() external payable {
        require(
            block.timestamp < deploymentTimeStamp + lockTime,
            "cannot fund until deployed"
        );
        require(convertEthToUSD(msg.value) >= MINIMUN_VALUE, "Send more ETH");
        fundersToAmount[msg.sender] += msg.value;
    }

    function convertEthToUSD(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10**8);
        // Chainlink 返回的价格精度是 8 位小数（即 ETH/USD * 10^8）
        // wei * price / 10^8
    }

    // 转换拥有者
    function transferOwnerShip(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    // address(this) 等价于 msg，address(this).balance = msg.value
    // address(this).balance单位是wei，转化为usd
    function getFund() external onlyOwner {
        require(
            block.timestamp > deploymentTimeStamp + lockTime,
            "Lock period not over yet"
        );
        require(
            convertEthToUSD(address(this).balance) >= TARGET,
            "window is not closed"
        );

        // 转账方式transfer，失败回退
        // payable(msg.sender).transfer(address(this).balance);

        // send方式返回布尔值
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success);

        // call方式
        // 返回布尔值和函数回调结果，(bool,result),花括号传入value，括号传入执行函数（转账成功之后执行
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(success, "transfer tx failed");
        // fundersToAmount[msg.sender] = 0; // ?? 没有用
        getFundSuccess = true;
    }

    // 退款
    // 不满足目标值可以退款，同时必须已经存入值，才可以退款
    function refund() external windowClosed {
        require(
            block.timestamp > deploymentTimeStamp + lockTime,
            "cannot fund until deployed"
        );
        require(
            convertEthToUSD(address(this).balance) < TARGET,
            "target is reached"
        );
        bool success;
        (success, ) = payable(msg.sender).call{
            value: fundersToAmount[msg.sender]
        }("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder,uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr,"you do not have permission to call this funtion");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed() {
        require(
            fundersToAmount[msg.sender] != 0,
            "you didn't send any tokens before"
        );
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner"
        );
        _;
    }
}
