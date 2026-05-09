import React, { useState, useEffect } from "react";
// import { Form, Button, Input, Container, Segment, Icon, Card, Divider, Header } from "semantic-ui-react";
import toast, { Toaster } from "react-hot-toast";
import Layout from "../../components/Layout";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";
import Campaign from "../../ethereum/campaign";
import { Link } from "../../routes";
// Add 'Grid' to this list
import { Form, Button, Input, Container, Segment, Icon, Card, Divider, Header, Grid, Loader } from "semantic-ui-react";
const ProfilePage = () => {
    const [username, setUsername] = useState("");
    const [address, setAddress] = useState("");
    const [myCampaigns, setMyCampaigns] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    useEffect(() => {
    const loadData = async () => {
        try {
            const accounts = await web3.eth.getAccounts();
            const userAddr = accounts[0];
            
            if (!userAddr) {
                setLoadingCampaigns(false);
                return;
            }

            // Set the address state for the UI
            setAddress(userAddr);

            // 1. Fetch existing username immediately using userAddr 
            // (Don't wait for the 'address' state to update, it's too slow)
            const res = await fetch(`/api/users/profile/${userAddr.toLowerCase()}`);
            console.log(res.data)
            if (res.ok) {
                const data = await res.json();
                if (data.username) {
                    setUsername(data.username);
                }
            }

            // 2. Fetch all campaigns and filter
            const campaignAddresses = await factory.methods.getDeployedCampaigns().call();
            const summaries = await Promise.all(
                campaignAddresses.map(async (addr) => {
                    const campaign = Campaign(addr);
                    const summary = await campaign.methods.getSummary().call();
                    if (summary[4].toLowerCase() === userAddr.toLowerCase()) {
                        return {
                            address: addr,
                            balance: web3.utils.fromWei(summary[0].toString(), "ether")
                        };
                    }
                    return null;
                })
            );

            setMyCampaigns(summaries.filter(s => s !== null));
        } catch (err) {
            console.error("Profile load error:", err);
            toast.error("Error connecting to blockchain.");
        }
        setLoadingCampaigns(false);
    };

    loadData();
}, []);

    const onUpdateProfile = async (event) => {
        event.preventDefault();
        setLoadingProfile(true);
        const tid = toast.loading("Updating profile...");
        try {
            const res = await fetch(`/api/users/profile/${address.toLowerCase()}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Profile updated!", { id: tid });
        } catch (err) {
            toast.error(err.message, { id: tid });
        }
        setLoadingProfile(false);
    };

    const renderCampaigns = () => {
        if (loadingCampaigns) return <Loader active inline="centered" />;
        if (myCampaigns.length === 0) return <p>You haven't created any campaigns yet.</p>;

        const items = myCampaigns.map((c) => {
            return {
                header: `Campaign: ${c.address.substring(0, 10)}...`,
                meta: `Balance: ${c.balance} ETH`,
                description: (
                    <Link route={`/campaigns/${c.address}`}>
                        <Button basic color="blue" size="mini" style={{marginTop: '10px'}}>
                            View Dashboard
                        </Button>
                    </Link>
                ),
                fluid: true,
                raised: true
            };
        });

        return <Card.Group items={items} />;
    };

    return (
        <Layout>
            <Toaster position="top-right" />
            <Container style={{ marginTop: "40px" }}>
                <Grid stackable>
                    <Grid.Row>
                        {/* LEFT COLUMN: Profile Settings */}
                        <Grid.Column width={6}>
                            <Segment raised>
                                <Header as="h3"><Icon name="settings" /> Settings</Header>
                                <p style={{ color: "#666", wordBreak: 'break-all' }}>
                                    <Icon name="ethereum" /> {address}
                                </p>
                                <Form onSubmit={onUpdateProfile}>
                                    <Form.Field>
                                        <label>Display Name</label>
                                        <Input 
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Enter your name..." 
                                        />
                                    </Form.Field>
                                    <Button primary fluid loading={loadingProfile} type="submit">
                                        Update Name
                                    </Button>
                                </Form>
                            </Segment>
                        </Grid.Column>

                        {/* RIGHT COLUMN: Managed Campaigns */}
                        <Grid.Column width={10}>
                            <Segment raised>
                                <Header as="h2"><Icon name="rocket" color="blue" /> My Campaigns</Header>
                                <Divider />
                                {renderCampaigns()}
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        </Layout>
    );
};

export default ProfilePage;