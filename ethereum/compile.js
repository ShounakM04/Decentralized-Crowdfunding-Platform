// import path from 'path';
// import fs from 'fs-extra'
// import solc from 'solc';
const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

// const buildPath = path.resolve(__dirname,'build');
fs.removeSync('build');

// const campaignPath = path.resolve(__dirname,'contracts','Campaign.sol');
const source = fs.readFileSync('D:\\BLOCKCHAIN LECTURES\\kickstart\\ethereum\\contracts\\Campaign.sol', 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
      'Campaign.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },  
    },
  };
const output = JSON.parse(solc.compile(JSON.stringify(input)));

console.log(output);

fs.ensureDirSync('build');
for(let contract in output.contracts['Campaign.sol'])
{
    fs.outputJSONSync(
        path.resolve('build', contract.replace(':', '') + '.json'),
        output.contracts['Campaign.sol'][contract]
    );
}