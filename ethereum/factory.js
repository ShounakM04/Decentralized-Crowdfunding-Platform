import web3  from "./web3";
import Factory from "./build/Factory.json"

const instance = new web3.eth.Contract(
    Factory.abi , '0x14B4ce76881bdE399A0045005173E2Df0cbe71B0'
)

export default instance ;