import React, { useState } from "react";
import { Form, Button, Input, Message, Icon, Dropdown } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Campaign from "../ethereum/campaign";
import web3 from "../ethereum/web3";
import { Router } from "../routes";

// Define the valid web3 unit options for the dropdown
const unitOptions = [
  { key: 'wei', text: 'Wei', value: 'wei' },
  { key: 'kwei', text: 'Kwei', value: 'kwei' },
  { key: 'mwei', text: 'Mwei', value: 'mwei' },
  { key: 'gwei', text: 'Gwei', value: 'gwei' },
  { key: 'ether', text: 'Ether', value: 'ether' },
];

const ContributeForm = (props) => {
  const [contributedMoney, setContributedMoney] = useState(""); 
  const [unit, setUnit] = useState("ether"); 
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success notification

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoader(true);
      setErrorMessage('');
      setSuccessMessage(''); // Clear any previous success messages
      
      const accounts = await web3.eth.getAccounts();
      const campaign = Campaign(props.addr);
      
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(contributedMoney, unit), 
      });

      // Transaction successful! Set the notification and clear the input
      setSuccessMessage(`Successfully contributed ${contributedMoney} ${unit}!`);
      setContributedMoney(''); 
      
      // Refresh the page data in the background
      Router.replaceRoute(`/campaigns/${props.addr}`);
      
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }
    setLoader(false);
  };

  const handleContributionInput = (event) => {
    setContributedMoney(event.target.value);
    setErrorMessage(''); // Clear errors when user starts typing again
    setSuccessMessage(''); // Clear success message when user starts a new contribution
  };

  const handleUnitChange = (event, data) => {
    setUnit(data.value);
    setSuccessMessage(''); // Clear success if they change units
  };

  return (
    <>
      {/* Notice the added success={!!successMessage} prop here */}
      <Form onSubmit={handleSubmit} error={errorMessage !== ""} success={successMessage !== ""}>
        
        <div className="form-header">
          <h3 className="form-title">
            <Icon name="bolt" style={{ color: '#fbbf24' }} /> Back this Project
          </h3>
          <p className="form-subtitle">
            Enter the amount you want to contribute.
          </p>
        </div>

        <Form.Field>
          <label className="input-label">Amount to Contribute</label>
          <Input
            label={
              <Dropdown 
                defaultValue="ether" 
                options={unitOptions} 
                onChange={handleUnitChange}
                className="unit-dropdown"
              />
            }
            labelPosition="right"
            placeholder="e.g., 0.1"
            onChange={handleContributionInput}
            value={contributedMoney}
            required
            className="custom-input"
          />
        </Form.Field>

        {/* Error Message */}
        <Message 
          error 
          className="error-message"
          header="Contribution Failed"
          content={
            errorMessage.charAt(errorMessage.length - 1) === 'n' || errorMessage.charAt(errorMessage.length - 1) === 't' 
              ? "Please enter a valid numeric value." 
              : errorMessage.charAt(errorMessage.length - 2) === 'e' 
                ? "Transaction was rejected by the user in MetaMask." 
                : "An unexpected error occurred with the network."
          }
        />

        {/* Success Message */}
        <Message 
          success
          className="success-message"
          header="Transaction Confirmed"
          content={successMessage}
        />

        <Button 
          type="submit" 
          loading={loader} 
          fluid 
          size="large"
          className="submit-btn"
        >
          <Icon name="paper plane outline" /> Contribute Now
        </Button>
      </Form>

      {/* Scoped Styling for the Form */}
      <style jsx>{`
        .form-header {
          margin-bottom: 20px;
        }

        .form-title {
          margin: 0;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }

        .form-subtitle {
          color: #6b7280;
          font-size: 0.95rem;
          margin-top: 4px;
        }

        .input-label {
          font-weight: 600 !important;
          color: #374151 !important;
          font-family: 'Inter', sans-serif !important;
        }

        /* Input Styling */
        :global(.custom-input input) {
          border-radius: 8px 0 0 8px !important;
          border: 1px solid #d1d5db !important;
          font-family: 'Roboto Mono', monospace !important;
        }

        :global(.custom-input input:focus) {
          border-color: #4f46e5 !important;
        }

        /* Dropdown Label Styling */
        :global(.custom-input .ui.dropdown.label) {
          border-radius: 0 8px 8px 0 !important;
          background-color: #f3f4f6 !important;
          border: 1px solid #d1d5db !important;
          border-left: none !important;
          color: #4b5563 !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          display: flex !important;
          align-items: center !important;
        }

        :global(.custom-input .ui.dropdown.label .menu) {
          border-radius: 8px !important;
          border-color: #d1d5db !important;
        }

        /* Call to Action Button */
        :global(.submit-btn) {
          background-color: #4f46e5 !important;
          color: white !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          margin-top: 15px !important;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2) !important;
          transition: all 0.2s ease-in-out !important;
        }

        :global(.submit-btn:hover) {
          background-color: #4338ca !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2) !important;
        }

        /* Error Message Standardization */
        :global(.error-message) {
          border-radius: 8px !important;
          border: 1px solid #fecaca !important;
          background-color: #fef2f2 !important;
          color: #991b1b !important;
          box-shadow: none !important;
        }

        /* Success Message Standardization */
        :global(.success-message) {
          border-radius: 8px !important;
          border: 1px solid #bbf7d0 !important;
          background-color: #f0fdf4 !important;
          color: #166534 !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default ContributeForm;