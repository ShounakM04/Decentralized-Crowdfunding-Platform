import React, { useState } from 'react';
import { Form, Button, Input, Message, Container } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/web3';

const EditProfile = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const accounts = await web3.eth.getAccounts();
      // Use the PUT method we created in the earlier step
      await fetch(`/api/users/${accounts[0].toLowerCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      alert("Profile Updated!");
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Container style={{ marginTop: '20px' }}>
        <h3>Update Your Profile123</h3>
        <Form onSubmit={onSubmit}>
          <Form.Field>
            <label>Display Name</label>
            <Input 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. Alice Crypto" 
            />
          </Form.Field>
          <Button primary loading={loading}>Save Profile</Button>
        </Form>
      </Container>
    </Layout>
  );
};

export default EditProfile;