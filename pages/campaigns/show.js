import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import { Button, Grid, Icon, Segment } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Campaign from "../../ethereum/campaign";
import ContributeForm from "../../components/ContributeForm";
import { Link } from "../../routes";

export async function getServerSideProps(props) {
  const campaign = Campaign(props.query.address);
  const campaignAddress = props.query.address;
  const summary = await campaign.methods.getSummary().call();

  return {
    props: {
      minimumContribution: summary[0]?.toString(),
      balance: summary[1]?.toString(),
      requestsCount: summary[2]?.toString(),
      approversCount: summary[3]?.toString(),
      manager: summary[4]?.toString(),
      campaignAdd: campaignAddress?.toString(),
    },
  };
}

const Show = (props) => {
  const {
    minimumContribution,
    balance,
    requestsCount,
    approversCount,
    manager,
    campaignAdd,
  } = props;

  // --- NEW STATES FOR WEB3 AUTH & DB PROFILES ---
  const [managerName, setManagerName] = useState("Loading...");
  const [currentAccount, setCurrentAccount] = useState("");

  useEffect(() => {
    const fetchManagerProfile = async () => {
      // 1. Get current logged in user from MetaMask
      const accounts = await web3.eth.getAccounts();
      setCurrentAccount(accounts[0] || "");

      // 2. Fetch the Manager's name from our DB API
      try {
        const res = await fetch(`/api/users/profile/${manager}`);
        const data = await res.json();
        setManagerName(data.username || "Anonymous Manager");
      } catch (err) {
        setManagerName("Anonymous Manager");
      }
    };

    fetchManagerProfile();
  }, [manager]);

  // Logic to check if the viewer IS the manager
  const isManager = currentAccount.toLowerCase() === manager.toLowerCase();

  return (
    <Layout>
      <div className="dashboard-container">
        
        {/* Compact Header */}
        <div className="header-section">
          <h2 className="page-title">
            <Icon name="chart pie" style={{ color: "#4f46e5" }} /> 
            Campaign Dashboard
          </h2>
          <p className="page-subtitle">
            Smart contract overview and contribution portal.
          </p>
        </div>

        <Grid stackable columns={2}>
          <Grid.Row>
            
            {/* Left Column: Data & Stats */}
            <Grid.Column width={10}>
              
              {/* Manager Banner - Updated with Manager Name from DB */}
              <Segment className="manager-banner">
                <div className="banner-label">
                  <Icon name="user shield" /> Contract Manager: <strong>{managerName}</strong>
                </div>
                <div className="banner-address">{manager}</div>
                <div className="banner-helper">Creator of the campaign; authorized to create spending requests.</div>
              </Segment>

              <div className="stats-grid">
                <div className="stat-box highlight-box">
                  <div className="stat-header"><Icon name="ethereum" /> Campaign Balance</div>
                  <div className="stat-value">{web3.utils.fromWei(balance, "ether")} ETH</div>
                  <div className="stat-helper">Available funds to spend.</div>
                </div>

                <div className="stat-box">
                  <div className="stat-header"><Icon name="angle double right" /> Min. Contribution</div>
                  <div className="stat-value">{minimumContribution} <span style={{fontSize:"0.8rem", color:"#6b7280"}}>wei</span></div>
                  <div className="stat-helper">Required to become an approver.</div>
                </div>

                <div className="stat-box">
                  <div className="stat-header"><Icon name="file alternate outline" /> Spending Requests</div>
                  <div className="stat-value">{requestsCount}</div>
                  <div className="stat-helper">Pending/completed withdrawals.</div>
                </div>

                <div className="stat-box">
                  <div className="stat-header"><Icon name="users" /> Total Approvers</div>
                  <div className="stat-value">{approversCount}</div>
                  <div className="stat-helper">Backers who have donated.</div>
                </div>
              </div>

              <div className="action-row">
                <Link route={`/campaigns/${campaignAdd}/requests`} legacyBehavior>
                  <a style={{ textDecoration: "none" }}>
                    <Button fluid size="large" className="requests-btn">
                      <Icon name="list alternate outline" /> View Spending Requests
                    </Button>
                  </a>
                </Link>
              </div>
            </Grid.Column>

            {/* Right Column: Dynamic Form Section */}
            <Grid.Column width={6}>
              <div className="form-wrapper">
                {isManager ? (
                  // WHAT THE MANAGER SEES
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <Icon name="vcard outline" size="huge" color="grey" style={{ marginBottom: "15px" }} />
                    <h3 style={{ color: "#111827" }}>Manager View</h3>
                    <p style={{ color: "#6b7280" }}>
                      You are the owner of this campaign. You cannot contribute to your own project. 
                    </p>
                    <Link route={`/campaigns/${campaignAdd}/requests/new`} legacyBehavior>
                      <Button primary fluid style={{ marginTop: "10px" }}>
                        Create Spending Request
                      </Button>
                    </Link>
                  </div>
                ) : (
                  // WHAT EVERYONE ELSE SEES
                  <ContributeForm addr={campaignAdd} />
                )}
              </div>
            </Grid.Column>

          </Grid.Row>
        </Grid>
      </div>

      {/* Shared Global Styling for Single-View Compactness */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          background-color: #f9fafb; 
        }

        .dashboard-container {
          margin-top: 30px; /* Reduced from 50px */
          margin-bottom: 30px;
          animation: fadeIn 0.4s ease-out;
        }

        .header-section {
          margin-bottom: 25px; /* Reduced margin */
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .page-title {
          margin: 0;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.8rem; /* Slightly smaller to save space */
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 4px;
          font-size: 1rem;
        }

        /* Manager Banner */
        .manager-banner {
          background: #ffffff !important;
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          padding: 16px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
          margin-bottom: 16px !important; /* Tight spacing */
        }

        .banner-label {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .banner-address {
          font-family: 'Roboto Mono', monospace;
          color: #4f46e5;
          font-weight: 600;
          font-size: 1.05rem;
          word-break: break-all;
          background-color: #f3f4f6;
          padding: 6px 10px;
          border-radius: 6px;
          display: inline-block;
        }

        .banner-helper {
          color: #9ca3af;
          font-size: 0.85rem;
          margin-top: 6px;
        }

        /* 2x2 Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px; /* Tight grid spacing */
        }

        .stat-box {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.08);
          border-color: #d1d5db;
        }

        .highlight-box {
          background-color: #f5f3ff;
          border-color: #c7d2fe;
        }

        .highlight-box .stat-value {
          color: #4338ca !important;
        }

        .stat-header {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-family: 'Roboto Mono', monospace;
          font-size: 1.6rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .stat-helper {
          color: #9ca3af;
          font-size: 0.85rem;
          line-height: 1.3;
        }

        /* Action Row */
        .action-row {
          margin-top: 16px;
        }

        .requests-btn {
          background-color: #ffffff !important;
          color: #4f46e5 !important;
          border: 1px solid #4f46e5 !important;
          border-radius: 12px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          transition: all 0.2s ease-in-out !important;
        }

        .requests-btn:hover {
          background-color: #f5f3ff !important;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1) !important;
        }

        /* Form Wrapper */
        .form-wrapper {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr; /* Stack on small screens */
          }
        }
      `}</style>
    </Layout>
  );
};

export default Show;