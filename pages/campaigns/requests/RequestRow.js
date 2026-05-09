import React, { useState } from "react";
import { Table, TableRow, TableCell, Button } from "semantic-ui-react";
import web3 from "../../../ethereum/web3";
import Campaign from "../../../ethereum/campaign";
import { Router } from "../../../routes";
import toast from "react-hot-toast"; // Import toast

const RequestRow = (props) => {
  const { id, request, contributersCount, address, isManager, currentUser } = props;
  const [loading, setLoading] = useState(false);

  const isComplete = request.complete;
  const readyToFinalize = parseInt(request.countVotedYes) >= parseInt(contributersCount) / 2;

  const onApprove = async () => {
    const campaign = Campaign(address);
    setLoading(true);
    const tid = toast.loading("Approving request..."); // Start loading toast

    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.approveRequest(id).send({ from: accounts[0] });
      
      toast.success("Request Approved!", { id: tid }); // Update to success
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (err) {
      toast.error(err.message.split("\n")[0], { id: tid }); // Update to error
    }
    setLoading(false);
  };

  const onFinalize = async () => {
    const campaign = Campaign(address);
    setLoading(true);
    const tid = toast.loading("Finalizing transaction...");

    try {
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.finalizeRequest(id).send({ from: accounts[0] });

      toast.success("Request Finalized & Paid!", { id: tid });
      Router.replaceRoute(`/campaigns/${address}/requests`);
    } catch (err) {
      toast.error(err.message.split("\n")[0], { id: tid });
    }
    setLoading(false);
  };

  return (
    <TableRow disabled={isComplete} positive={readyToFinalize && !isComplete}>
      <TableCell>{id + 1}</TableCell>
      <TableCell>{request.description}</TableCell>
      <TableCell>{web3.utils.fromWei(request.value, "ether")} ETH</TableCell>
      <TableCell>
        <div style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {request.recipient}
        </div>
      </TableCell>
      <TableCell>{request.countVotedYes}/{contributersCount}</TableCell>

      <TableCell>
        {currentUser && !isManager && !isComplete && (
          <Button color="blue" basic onClick={onApprove} loading={loading}>
            Approve
          </Button>
        )}
      </TableCell>

      <TableCell>
        {currentUser && isManager && !isComplete && (
          <Button 
            color="green" 
            onClick={onFinalize} 
            loading={loading}
            disabled={!readyToFinalize}
          >
            Finalize
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;