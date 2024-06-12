"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const shortenAddress = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    } else {
      setMessage('MetaMask is not installed.');
    }
  }, []);

  const fetchWalletDetails = async () => {
    try {
      const signer = provider!.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
      setMessage('Wallet connected.');
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleConnectWallet = async () => {
    if (provider) {
      setIsLoading(true); // Set loading state to true
      try {
        await provider.send('eth_requestAccounts', []);
        await fetchWalletDetails();
      } catch (error) {
        if (error.code === -32002) {
          setMessage('Already processing connection request. Retrying in 3 seconds...');
          setTimeout(() => {
            handleConnectWallet(); // Retry after 3 seconds
          }, 3000);
        } else {
          console.error('Error connecting wallet:', error);
          setMessage(`Error: ${error.message}`);
        }
      } finally {
        setIsLoading(false); // Set loading state to false
      }
    }
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setMessage('Wallet disconnected.');
  };

  return (
    <div className="wallet-connect">
      <style jsx>{`
        .wallet-connect {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }
        .wallet-connect button {
          padding: 10px 20px;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          margin-left: 10px;
        }
        .connect-button {
          background-color: #007bff;
        }
        .disconnect-button {
          background-color: #dc3545;
        }
        .loading-button {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
      {walletAddress && (
        <div className="flex items-center mr-4">
          <p className="text-sm text-gray-600">
            Address: <span className="font-normal">{shortenAddress(walletAddress)}</span>
          </p>
        </div>
      )}
      {isConnected ? (
        <button className="disconnect-button" onClick={handleDisconnectWallet}>
          Disconnect Wallet
        </button>
      ) : (
        <button
          className={`connect-button ${isLoading ? 'loading-button' : ''}`}
          onClick={handleConnectWallet}
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {message && <p className="mt-2 text-blue-500">{message}</p>}
    </div>
  );
};

export default WalletConnect;
