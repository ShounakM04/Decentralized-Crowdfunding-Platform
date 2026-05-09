import React from "react";
import Layout from "../../../components/Layout";
import { Toaster } from 'react-hot-toast';
import {
  Grid,
  Button,
  Table,
  Icon,
  Message,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import { Link } from "../../../routes";
import Campaign from "../../../ethereum/campaign";
import RequestRow from "./RequestRow";
import { useState, useEffect } from "react";
export async function getServerSideProps(props) {
  const campaign = Campaign(props.query.address);
  const summary = await campaign.methods.getSummary().call();
  const requestCount = await campaign.methods.getRequestsCount().call();

  const requests = await Promise.all(
    Array(parseInt(requestCount))
      .fill()
      .map(async (element, index) => {
        const request = await campaign.methods.requests(index).call();

        const convertedRequest = {};
        for (let key in request) {
          if (typeof request[key] === "bigint") {
            convertedRequest[key] = request[key].toString();
          } else {
            convertedRequest[key] = request[key];
          }
        }
        return convertedRequest;
      })
  );

  const contributersCount = await campaign.methods.approversCount().call();
  
  return {
    props: {
      address: props.query.address,
      requests: JSON.stringify(requests),
      requestCount: requestCount.toString(),
      contributersCount: contributersCount.toString(),
      manager: summary[4].toString(),
    },
  };
}

const RequestsList = (props) => {
  const { address, requests: requestsJSON, requestCount, contributersCount, manager } = props;
  const requests = JSON.parse(requestsJSON);
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    const getAccount = async () => {
      // Check for window.ethereum specifically before touching our web3 import
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Re-instantiate if necessary to avoid the 'undefined' error
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0].toLowerCase());
          }
        } catch (err) {
          console.error("MetaMask account fetch error:", err);
        }
      }
    };
    getAccount();

    // Optional: Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            setCurrentAccount(accounts[0] ? accounts[0].toLowerCase() : "");
        });
    }
  }, []);

  const isManager = currentAccount === manager.toLowerCase();
  const renderRow = () => {
    return requests.map((request, index) => {
      return (
        <RequestRow  
          key={index}
          id={index}
          request={request}
          address={address}
          contributersCount={contributersCount}
          isManager={isManager}
          currentUser={currentAccount}
        />
      );
    });
  };

  return (
    <Layout>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="page-container">
        
        {/* Consistent Dashboard Header Layout */}
        <div className="header-section">
          <Grid verticalAlign="middle" stackable>
            <Grid.Row>
              <Grid.Column width={10}>
                <h2 className="page-title">
                  <Icon name="list alternate outline" style={{ color: "#4f46e5" }} />
                  Spending Requests
                </h2>
                <p className="page-subtitle">
                  Review withdrawal requests from the manager. Approvers can vote to authorize payments.
                </p>
              </Grid.Column>
              <Grid.Column width={6} textAlign="right">
                {/* MODIFIED: Only show the button if isManager is true */}
                {isManager && (
                  <Link route={`/campaigns/${address}/requests/new`} legacyBehavior>
                    <a style={{ textDecoration: "none" }}>
                      <Button 
                        primary 
                        icon labelPosition="left" 
                        className="action-btn"
                      >
                        <Icon name="plus" /> Add Request
                      </Button>
                    </a>
                  </Link>
                )}
              </Grid.Column>
              {/* <Grid.Column width={6} textAlign="right">
                <Link route={`/campaigns/${address}/requests/new`} legacyBehavior>
                  <a style={{ textDecoration: "none" }}>
                    <Button 
                      primary 
                      icon labelPosition="left" 
                      className="action-btn"
                    >
                      <Icon name="plus" /> Add Request
                    </Button>
                  </a>
                </Link>
              </Grid.Column> */}
            </Grid.Row>
          </Grid>
        </div>

        {/* Empty State vs Table Rendering */}
        {requests.length === 0 ? (
          <Message icon className="empty-state">
            <Icon name="folder open outline" className="text-slate-400" />
            <Message.Content>
              <Message.Header className="text-slate-900">No Requests Found</Message.Header>
              <p className="text-slate-500" style={{ marginTop: "4px" }}>
                The manager has not created any spending requests for this campaign yet.
              </p>
            </Message.Content>
          </Message>
        ) : (
          <div className="table-wrapper">
            {/* basic="very" removes the harsh outer borders of the Semantic UI table */}
            <Table basic="very" unstackable className="custom-table">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>ID</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.HeaderCell>Amount</Table.HeaderCell>
                  <Table.HeaderCell>Recipient</Table.HeaderCell>
                  <Table.HeaderCell>Approval Count</Table.HeaderCell>
                  <Table.HeaderCell>Approve</Table.HeaderCell>
                  <Table.HeaderCell>Finalize</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {renderRow()}
              </Table.Body>
            </Table>
          </div>
        )}

        {/* Professional Footer Metadata */}
        <div className="footer-metadata">
          <Icon name="info circle" /> Found {requestCount} total request{requestCount === "1" ? "" : "s"}
        </div>
      </div>

      {/* Scoped Styling for Table & Consistency */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          background-color: #f9fafb; 
        }

        .page-container {
          margin-top: 40px;
          margin-bottom: 60px;
          animation: fadeIn 0.4s ease-out;
        }

        .header-section {
          margin-bottom: 30px;
        }

        .page-title {
          margin: 0;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 2rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 8px;
          font-size: 1.05rem;
          font-weight: 400;
        }

        /* Action Button Styling */
        .action-btn {
          background-color: #4f46e5 !important;
          color: white !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2) !important;
          transition: all 0.2s ease-in-out !important;
        }

        .action-btn:hover {
          background-color: #4338ca !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2) !important;
        }

        /* Table Container Styling */
        .table-wrapper {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          overflow-x: auto; /* Ensures table is scrollable on small screens */
          margin-bottom: 16px;
        }

        /* Modern Table Overrides */
        :global(.custom-table) {
          margin: 0 !important;
          width: 100% !important;
          border-collapse: collapse !important;
        }

        /* Table Header Row Styling */
        :global(.custom-table thead th) {
          background-color: #f9fafb !important;
          color: #6b7280 !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 16px !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        /* Table Body Cell Styling */
        :global(.custom-table tbody td) {
          padding: 16px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          color: #374151 !important;
          vertical-align: middle !important;
        }

        /* Remove bottom border from the very last row so it doesn't double up with the wrapper */
        :global(.custom-table tbody tr:last-child td) {
          border-bottom: none !important;
        }

        /* Empty State */
        .empty-state {
          border-radius: 12px !important;
          border: 1px dashed #cbd5e1 !important;
          box-shadow: none !important;
          background-color: #f8fafc !important;
        }

        /* Footer Meta */
        .footer-metadata {
          color: #6b7280;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding-left: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
};

export default RequestsList;