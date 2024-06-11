import { ethers } from 'ethers';
import abi from '../abi.json';

const getContract = () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  return contract;
};

export default getContract;
