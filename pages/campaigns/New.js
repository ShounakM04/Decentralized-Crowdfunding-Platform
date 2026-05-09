import React, { useState } from "react";
import Layout from "../../components/Layout";
import "semantic-ui-css/semantic.min.css";
import {
  Form,
  Button,
  Input,
  Message,
  Icon,
  Grid,
  Segment
} from "semantic-ui-react";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";

const New = () => {
  // 1. All necessary state variables, including the new DB fields
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [minContribution, setMinContribution] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    setErrorMessage(""); // Clear any previous errors

    try {
      const accounts = await web3.eth.getAccounts();
      
      // Step A: Deploy to Blockchain
      await factory.methods.createCampaign(minContribution).send({
        from: accounts[0],
      });

      // Step B: Get the newly generated contract address
      const deployedCampaigns = await factory.methods.getDeployedCampaigns().call();
      const newAddress = deployedCampaigns[deployedCampaigns.length - 1];

      // Step C: Save rich metadata to your PostgreSQL database
      const dbResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ethAddress: newAddress,
          title: campaignTitle,
          description: campaignDescription,
          creatorAddress: accounts[0]
        }),
      });

      if (!dbResponse.ok) {
        throw new Error("Smart contract deployed, but failed to save details to the database.");
      }

      // Redirect back to the homepage
      Router.pushRoute('/');
      
    } catch (err) {
      // Show the actual error message from MetaMask or the DB
      setErrorMessage(err.message);
    }
    
    setLoader(false);
  };

  return (
    <Layout>
      <div className="page-container">
        <Grid centered stackable>
          <Grid.Column style={{ maxWidth: "600px", width: "100%" }}>
            
            <div className="header-section">
              <h2 className="page-title">
                <Icon name="rocket" style={{ color: '#4f46e5' }} /> 
                Launch a Campaign
              </h2>
              <p className="page-subtitle">
                Set up your decentralized project and start accepting contributions.
              </p>
            </div>

            <Segment className="form-card" padded="very">
              {/* Note: 'error' prop triggers the Message component if errorMessage is not empty */}
              <Form onSubmit={handleSubmit} error={!!errorMessage}>
                
                {/* NEW FIELD: Campaign Title */}
                <Form.Field>
                  <label className="input-label">Campaign Title</label>
                  <p className="input-helper">Give your project a catchy name.</p>
                  <Input
                    placeholder="e.g., Next-Gen Solid State Batteries"
                    value={campaignTitle}
                    onChange={(e) => {
                      setCampaignTitle(e.target.value);
                      setErrorMessage("");
                    }}
                    className="custom-input"
                    required
                  />
                </Form.Field>

                {/* NEW FIELD: Campaign Description */}
                <Form.Field>
                  <label className="input-label">Campaign Description</label>
                  <p className="input-helper">Describe what you are building and why you need funds.</p>
                  <Input
                    placeholder="e.g., We are developing a sustainable alternative to..."
                    value={campaignDescription}
                    onChange={(e) => {
                      setCampaignDescription(e.target.value);
                      setErrorMessage("");
                    }}
                    className="custom-input"
                    required
                  />
                </Form.Field>

                {/* EXISTING FIELD: Minimum Contribution */}
                <Form.Field>
                  <label className="input-label">Minimum Contribution</label>
                  <p className="input-helper">
                    How much Wei must a user contribute to become a voting backer?
                  </p>
                  <Input
                    label="wei"
                    labelPosition="right"
                    placeholder="e.g., 100"
                    value={minContribution}
                    onChange={(e) => {
                      setMinContribution(e.target.value);
                      setErrorMessage("");
                    }}
                    className="custom-input"
                    required
                  />
                </Form.Field>

                {/* UPDATED: Dynamic Error Message */}
                <Message 
                  error 
                  className="error-message"
                  header="Transaction Failed"
                  content={errorMessage}
                />

                <Button 
                  type="submit" 
                  loading={loader} 
                  size="large"
                  fluid
                  className="submit-btn"
                >
                  <Icon name="check circle outline" /> Create Campaign
                </Button>
              </Form>
            </Segment>

          </Grid.Column>
        </Grid>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          background-color: #f9fafb; 
        }

        .page-container {
          margin-top: 60px;
          margin-bottom: 60px;
          animation: fadeIn 0.5s ease-out;
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
          font-size: 1.1rem;
          font-weight: 400;
          line-height: 1.5;
        }

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

        .error-message {
          border-radius: 8px !important;
          border: 1px solid #fecaca !important;
          background-color: #fef2f2 !important;
          color: #991b1b !important;
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

export default New;