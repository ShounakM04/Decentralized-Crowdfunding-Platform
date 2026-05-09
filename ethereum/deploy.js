const hdWalletProvider = require('@truffle/hdwallet-provider');
const {Web3} = require('web3');

const compiledFactory = require('./build/Factory.json');
// const compiledCampaign = require('../ethereum/build/Campaign.json');

const provider = new hdWalletProvider(
    'relief abandon fortune then borrow fury oyster delay vast lecture riot shadow',
    'https://eth-sepolia.g.alchemy.com/v2/x1zo6tSvaaLC9sLqEGbiR976DFlRdCU0'

);
const web3 = new Web3(provider);


const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts(); 
        console.log(accounts);

        console.log('Attempting to deploy contract from', accounts[0]);

        console.log(compiledFactory.abi);

        const result  = await new web3.eth.Contract(compiledFactory.abi)
            .deploy({data: (compiledFactory.evm).bytecode.object})
            .send({ gas:'1400000', from : accounts[0]});

        console.log('Contract deployed to ', result.options.address);
    } catch (error) {
        console.error('Error deploying contract:', error);
    } finally {
        // Stop the provider to release resources
        provider.engine.stop();
    }
};

deploy();