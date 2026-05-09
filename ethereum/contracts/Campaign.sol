// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Factory{
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public 
    {
        address newCampaign = address(new Campaign(minimum,msg.sender));
        deployedCampaigns.push(newCampaign);
    }
    function getDeployedCampaigns() public view returns(address[] memory)
    {
       
        return   deployedCampaigns;
    }
}

contract  Campaign{
    struct Request{
        string description;
        uint value;
        address payable receipient;
        bool complete;
        uint countVotedYes;
        mapping(address => bool)  votedYes;//stores who voted yes for this request
    }
        Request[] public requests;  
        address public manager;
        uint public  minimumContribution;
        mapping(address => bool) public approvers;//Tracks the record who has contributed in the campaign
        uint public approversCount;

        modifier restricted()
        {
            require(msg.sender == manager);
            _;
        }


        constructor(uint minimum,address creator)
        {
            manager = creator;
            minimumContribution = minimum;
        }
        function contribute() public payable {
            require(msg.value > minimumContribution);
            approvers[msg.sender] = true;
            approversCount++;
        }

        function createRequest(string memory descp,uint val,address payable rec) public restricted
        {
            Request storage newReq = requests.push();
            newReq.description = descp;
            newReq.value = val;
            newReq.receipient = rec;
            newReq.complete = false;
            newReq.countVotedYes = 0;
        }
        function approveRequest(uint index) public
        {
            Request storage tempReq = requests[index];
            require(approvers[msg.sender]);//can only be approved when it is a contributor
            require(!tempReq.votedYes[msg.sender]);//It should not voted earlier

            tempReq.votedYes[msg.sender]=true;
            tempReq.countVotedYes++;
        }
        function finalizeRequest(uint index) public restricted{
            Request storage newReq = requests[index];

            require(newReq.countVotedYes >= approversCount/2);
            require(newReq.complete!=true);
            newReq.receipient.transfer(newReq.value);
            newReq.complete = true;
        }
        function showpool() public view returns(uint) 
        {
            return address(this).balance;
        }


    function getSummary() public view returns (
      uint, uint, uint, uint, address
      ) {
        return (
          minimumContribution,
          address(this).balance,
          requests.length,
          approversCount,
          manager
        );
    }
    
    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}