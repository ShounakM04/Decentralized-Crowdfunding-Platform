import React from "react";
import factory from "../ethereum/factory";
import { Card, Button, Grid, Icon, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import Layout from "../components/Layout";
import { Link } from "../routes";

export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:3000/api/campaigns');
    
    // Check if the server returned a 200 OK status
    if (!res.ok) {
      console.error(`Failed to fetch: ${res.status} ${res.statusText}`);
      return { props: { campaigns: [] } }; // Return an empty array to prevent a crash
    }

    const campaignsFromDB = await res.json();
    return { props: { campaigns: campaignsFromDB } };
    
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { props: { campaigns: [] } };
  }
}
const CampaignList = ({ campaigns }) => {
  const renderCampaigns = () => {
    if (!campaigns || campaigns.length === 0) {
      return (
        <Message icon className="empty-state-message">
          <Icon name="inbox" className="text-slate-400" />
          <Message.Content>
            <Message.Header className="text-slate-900">No Campaigns Found</Message.Header>
            <p className="text-slate-500" style={{ marginTop: "4px" }}>
              Be the first to create a new campaign on the network!
            </p>
          </Message.Content>
        </Message>
      );
    }

    const items = campaigns.map((campaign) => {
      return {
        header: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827', fontWeight: '600', fontSize: '1.1rem' }}>
            <div className="icon-container">
              <Icon name="ethereum" style={{ margin: 0, color: '#4f46e5' }} />
            </div>
            {campaign.title} {/* Render the DB Title */}
          </div>
        ),
        meta: (
          <div className="address-badge">
            {campaign.ethAddress} {/* FIX: Changed from address to campaign.ethAddress */}
          </div>
        ),
        description: (
          <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '12px' }}>
            {campaign.description} {/* FIX: Render the DB Description instead of hardcoded text */}
          </p>
        ),
        extra: (
          <Link route={`/campaigns/${campaign.ethAddress}`} legacyBehavior>
            <a className="view-link">
              View Campaign Details <Icon name="arrow right" size="small" style={{ marginLeft: '4px' }} />
            </a>
          </Link>
        ),
        fluid: true,
        className: "campaign-card", 
      };
    });

    return <Card.Group items={items} />;
  };

  return (
    <Layout>
      <div className="page-container">
        <Grid verticalAlign="middle" stackable>
          <Grid.Row>
            <Grid.Column width={10}>
              <h2 className="page-title">
                <Icon name="rocket" style={{ color: '#4f46e5' }} /> Open Campaigns
              </h2>
              <p className="page-subtitle">
                Explore active projects, verify their smart contracts, and fund the future.
              </p>
            </Grid.Column>
            
            <Grid.Column width={6} textAlign="right">
              <Link route="/campaigns/New" legacyBehavior>
                <a style={{ textDecoration: "none" }}>
                  <Button
                    content="Create Campaign"
                    icon="add circle"
                    labelPosition="right"
                    size="large"
                    className="create-btn"
                  />
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <hr className="divider" />

        <div>{renderCampaigns()}</div>
      </div>

      {/* Scoped CSS for Professional Typography & Colors */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          background-color: #f9fafb; /* Very soft light gray background for the whole page */
        }

        .page-container {
          margin-top: 50px;
          margin-bottom: 50px;
          animation: fadeIn 0.6s ease-out;
        }

        .page-title {
          margin: 0;
          color: #111827; /* Near black for high contrast */
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 2rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280; /* Elegant slate gray */
          margin-top: 10px;
          font-size: 1.1rem;
          font-weight: 400;
          line-height: 1.5;
        }

        .divider {
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 35px 0;
        }

        /* Campaign Card Styling */
        .campaign-card {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          background: #ffffff !important;
          padding: 6px !important;
        }

        .campaign-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          border-color: #d1d5db !important;
        }

        /* Ethereum Address Styling */
        .address-badge {
          font-family: 'Roboto Mono', monospace;
          background-color: #f3f4f6;
          color: #374151;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-top: 12px;
          display: inline-block;
          word-break: break-all;
          border: 1px solid #e5e7eb;
        }

        .icon-container {
          background-color: #e0e7ff; /* Soft indigo background */
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* View Link Styling */
        .view-link {
          font-weight: 600;
          color: #4f46e5; /* Deep Indigo */
          display: inline-flex;
          align-items: center;
          transition: color 0.2s;
          font-size: 0.95rem;
          padding: 8px 0;
        }

        .view-link:hover {
          color: #4338ca;
        }

        /* Primary Button Override */
        .create-btn {
          background-color: #4f46e5 !important; /* Indigo brand color */
          color: white !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.2) !important;
          transition: all 0.2s ease-in-out !important;
        }

        .create-btn:hover {
          background-color: #4338ca !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2) !important;
        }

        /* Empty State */
        .empty-state-message {
          border-radius: 12px !important;
          border: 1px dashed #cbd5e1 !important;
          box-shadow: none !important;
          background-color: #f8fafc !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
};

export default CampaignList;