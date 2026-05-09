import React, { useState } from "react";
import Layout from "../../../components/Layout";
import { Form, Input, Message, Button, Grid, Segment, Icon, Dropdown } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Campaign from "../../../ethereum/campaign";
import web3 from "../../../ethereum/web3";
import { Router, Link } from "../../../routes";

// Define the valid web3 unit options for the dropdown
const unitOptions = [
  { key: 'wei', text: 'Wei', value: 'wei' },
  { key: 'kwei', text: 'Kwei', value: 'kwei' },
  { key: 'mwei', text: 'Mwei', value: 'mwei' },
  { key: 'gwei', text: 'Gwei', value: 'gwei' },
  { key: 'ether', text: 'Ether', value: 'ether' },
];

export async function getServerSideProps(props) {
  return { props: { address: props.query.address } };
}

const NewRequest = (props) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // New success state
  const [Description, setDescription] = useState('');
  const [Amount, setAmount] = useState(""); 
  const [unit, setUnit] = useState("ether"); // New unit state
  const [Receipient, setReceipient] = useState('');
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const campaign = Campaign(props.address);
    try {
      setLoader(true);
      setErrorMessage('');
      setSuccessMessage('');
      const accounts = await web3.eth.getAccounts();

      // Pass the dynamically selected 'unit' state
      await campaign.methods
        .createRequest(Description, web3.utils.toWei(Amount, unit), Receipient)
        .send({
          from: accounts[0]
        });
        
      // Show success notification and clear form fields
      setSuccessMessage(`Successfully created request for ${Amount} ${unit}!`);
      setDescription('');
      setAmount('');
      setReceipient('');

      // Redirect back to the requests list
      Router.replaceRoute(`/campaigns/${props.address}/requests`);
      
    } catch (err) {
      setErrorMessage(err.message);
      console.log(err.message);
    }
    setLoader(false);
  };

  // Handlers now also clear notifications when the user starts typing
  const handleDescription = (e) => {
    setDescription(e.target.value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAmount = (e) => {
    setAmount(e.target.value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRecepient = (e) => {
    setReceipient(e.target.value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleUnitChange = (event, data) => {
    setUnit(data.value);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <Layout>
      <div className="page-container">
        
        {/* Back Navigation */}
        <div className="back-nav">
          <Link route={`/campaigns/${props.address}/requests`} legacyBehavior>
            <a className="back-link">
              <Icon name="arrow left" /> Back to Requests
            </a>
          </Link>
        </div>

        <Grid centered stackable>
          <Grid.Column style={{ maxWidth: "600px", width: "100%" }}>
            
            <div className="header-section">
              <h2 className="page-title">
                <Icon name="file signature" style={{ color: '#4f46e5' }} /> 
                Create a Request
              </h2>
              <p className="page-subtitle">
                Ask your approvers to authorize a withdrawal for campaign expenses.
              </p>
            </div>

            <Segment className="form-card" padded="very">
              {/* Added success prop dynamically */}
              <Form onSubmit={handleSubmit} error={errorMessage !== ''} success={successMessage !== ''}>
                
                <Form.Field>
                  <label className="input-label">Description</label>
                  <p className="input-helper">What is this money being used for?</p>
                  <Input 
                    placeholder="e.g., Buy battery materials from supplier"
                    onChange={handleDescription}
                    value={Description}
                    className="custom-input"
                    required
                  />
                </Form.Field>

                <Form.Field>
                  <label className="input-label">Amount Required</label>
                  <p className="input-helper">How much funds are required?</p>
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
                    placeholder="e.g., 1.5"
                    onChange={handleAmount}
                    value={Amount}
                    className="custom-input mono-input"
                    required
                  />
                </Form.Field>

                <Form.Field>
                  <label className="input-label">Recipient Address</label>
                  <p className="input-helper">Where should the smart contract send the money?</p>
                  <Input 
                    placeholder="e.g., 0x123..."
                    onChange={handleRecepient}
                    value={Receipient}
                    className="custom-input mono-input"
                    required
                  />
                </Form.Field>

                <Message 
                  error 
                  className="error-message"
                  header="Request Creation Failed"
                  content={
                    errorMessage.charAt(errorMessage.length-1) === 'd' || 
                    errorMessage.charAt(errorMessage.length-1) === 't' ||  
                    errorMessage.charAt(errorMessage.length-1) === 'n' 
                      ? "Please enter valid formatting for the input values." 
                      : errorMessage.charAt(errorMessage.length-1) === '.' 
                        ? "Transaction was rejected by the user in MetaMask." 
                        : "An unexpected network error occurred."
                  }
                />

                <Message 
                  success
                  className="success-message"
                  header="Request Submitted"
                  content={successMessage}
                />

                <Button 
                  type="submit" 
                  loading={loader} 
                  size="large"
                  fluid
                  className="submit-btn"
                >
                  <Icon name="check circle outline" /> Create Request
                </Button>
              </Form>
            </Segment>

          </Grid.Column>
        </Grid>
      </div>

      {/* Shared Global Styling for Consistency */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          background-color: #f9fafb; 
        }

        .page-container {
          margin-top: 30px;
          margin-bottom: 60px;
          animation: fadeIn 0.5s ease-out;
        }

        .back-nav {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .back-link {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #111827;
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .page-title {
          margin: 0;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
          font-size: 2.2rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 12px;
          font-size: 1.05rem;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Form Card Styling */
        .form-card {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025) !important;
          border-radius: 16px !important;
          border: 1px solid #e5e7eb !important;
          background: #ffffff !important;
        }

        .input-label {
          font-weight: 600 !important;
          color: #374151 !important;
          font-size: 1.05rem !important;
          margin-bottom: 4px !important;
        }

        .input-helper {
          color: #9ca3af;
          font-size: 0.9rem;
          margin-top: 0;
          margin-bottom: 12px;
        }

        /* Mono font for numbers and addresses */
        :global(.mono-input input) {
          font-family: 'Roboto Mono', monospace !important;
        }

        /* Input Styling */
        :global(.custom-input input) {
          border-radius: 8px !important;
          border: 1px solid #d1d5db !important;
        }

        /* Adjusting border radius when Dropdown is attached to the right */
        :global(.custom-input.mono-input input) {
          border-radius: 8px 0 0 8px !important;
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

        /* Submit Button Styling */
        .submit-btn {
          background-color: #4f46e5 !important;
          color: white !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          margin-top: 20px !important;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2) !important;
          transition: all 0.2s ease-in-out !important;
        }

        .submit-btn:hover {
          background-color: #4338ca !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2) !important;
        }

        /* Error Message Standardization */
        .error-message {
          border-radius: 8px !important;
          border: 1px solid #fecaca !important;
          background-color: #fef2f2 !important;
          color: #991b1b !important;
          box-shadow: none !important;
        }

        /* Success Message Standardization */
        .success-message {
          border-radius: 8px !important;
          border: 1px solid #bbf7d0 !important;
          background-color: #f0fdf4 !important;
          color: #166534 !important;
          box-shadow: none !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
};

export default NewRequest;