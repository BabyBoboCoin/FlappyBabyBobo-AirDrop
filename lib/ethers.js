import { ethers } from "ethers";
import PresaleABI from "./abi.json"; // Ensure the path is correct

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function getProvider() {
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getSigner(provider) {
  return provider.getSigner();
}

export function getContract(signer) {
  return new ethers.Contract(contractAddress, PresaleABI, signer);
}
