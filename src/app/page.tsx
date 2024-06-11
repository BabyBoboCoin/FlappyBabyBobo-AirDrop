"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Confetti from 'react-confetti';
import { FaCheck, FaTimes, FaDiscord, FaTelegramPlane } from 'react-icons/fa';
import Link from 'next/link';

const shortenAddress = (address: string) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

const Airdrop = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [tasksCompleted, setTasksCompleted] = useState({
    follow: false,
    retweet: false,
    like: false,
    discord: false,
    telegram: false,
  });

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
      try {
        await provider.send('eth_requestAccounts', []);
        await fetchWalletDetails();
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setMessage('Wallet disconnected.');
  };

  const handleTaskCompletion = (task: string, url: string) => {
    window.open(url, '_blank');
    setTasksCompleted((prev) => ({ ...prev, [task]: true }));
  };

  const handleCompleteTasks = async () => {
    if (Object.values(tasksCompleted).every((task) => task)) {
      try {
        const response = await fetch('/api/airdrop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ walletAddress }),
        });

        console.log('Response:', response);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error text:', errorText);
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response JSON:', data);

        if (data.success) {
          setShowConfetti(true);
          setMessage('Airdrop successfully claimed!');
          setTimeout(() => setShowConfetti(false), 5000);
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        console.error('Error claiming airdrop:', error);
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage('Please complete all tasks before claiming the airdrop.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 relative" style={{ background: 'linear-gradient(rgb(161, 227, 255) 0%, rgba(58, 121, 187, 0.98) 100%)', scrollBehavior: 'smooth', paddingTop: '70px' }}>
      <nav className="w-full fixed top-0 left-0 flex justify-between items-center p-4 bg-white bg-opacity-80 backdrop-filter backdrop-blur-md shadow-md z-50">
        <h1 className="text-3xl font-bold">$BABYBOBO Airdrop</h1>
        <div className="flex items-center">
          <Link href="/game" legacyBehavior>
            <a className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition">
              Play Game
            </a>
          </Link>
          {walletAddress && (
            <div className="flex items-center mr-4">
              <div className="flex flex-col items-end mr-2">
                <p className="text-sm text-gray-600">Address: <span className="font-normal">{shortenAddress(walletAddress)}</span></p>
              </div>
            </div>
          )}
          {isConnected ? (
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition"
              onClick={handleDisconnectWallet}
            >
              Disconnect Wallet
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
      <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center">
          <img src="/path/to/babybobo-image.png" alt="Babybobo" className="w-80 h-80 object-contain" />
          <h1 className="text-3xl font-bold mt-4">BABYBOBO Presale Starting Soon.</h1>
        </div>
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-md shadow-md rounded-lg p-8 max-w-md text-black">
          <h2 className="text-2xl font-bold mb-4">Connect your wallet and finish all tasks to participate in the airdrop:</h2>
          <ul className="mb-6">
            <li className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {tasksCompleted.follow ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                Follow Babybobo on X
              </div>
              <button
                onClick={() => handleTaskCompletion('follow', 'https://twitter.com/Babybobo')}
                className={`px-4 py-2 rounded transition-all duration-500 ${tasksCompleted.follow ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                disabled={tasksCompleted.follow}
              >
                {tasksCompleted.follow ? <FaCheck /> : 'Start'}
              </button>
            </li>
            <li className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {tasksCompleted.retweet ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                Retweet this post from Babybobo on X
              </div>
              <button
                onClick={() => handleTaskCompletion('retweet', 'https://twitter.com/Babybobo')}
                className={`px-4 py-2 rounded transition-all duration-500 ${tasksCompleted.retweet ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                disabled={tasksCompleted.retweet}
              >
                {tasksCompleted.retweet ? <FaCheck /> : 'Start'}
              </button>
            </li>
            <li className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {tasksCompleted.like ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                Like this post from Babybobo on X
              </div>
              <button
                onClick={() => handleTaskCompletion('like', 'https://twitter.com/Babybobo')}
                className={`px-4 py-2 rounded transition-all duration-500 ${tasksCompleted.like ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                disabled={tasksCompleted.like}
              >
                {tasksCompleted.like ? <FaCheck /> : 'Start'}
              </button>
            </li>
            <li className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {tasksCompleted.discord ? <FaCheck className="text-green-500 mr-2" /> : <FaDiscord className="text-purple-500 mr-2" />}
                Join the Babybobo Discord server
              </div>
              <button
                onClick={() => handleTaskCompletion('discord', 'https://discord.com/Babybobo')}
                className={`px-4 py-2 rounded transition-all duration-500 ${tasksCompleted.discord ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                disabled={tasksCompleted.discord}
              >
                {tasksCompleted.discord ? <FaCheck /> : 'Start'}
              </button>
            </li>
            <li className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {tasksCompleted.telegram ? <FaCheck className="text-green-500 mr-2" /> : <FaTelegramPlane className="text-blue-500 mr-2" />}
                Join the Babybobo Telegram server
              </div>
              <button
                onClick={() => handleTaskCompletion('telegram', 'https://telegram.org/Babybobo')}
                className={`px-4 py-2 rounded transition-all duration-500 ${tasksCompleted.telegram ? 'bg-green-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                disabled={tasksCompleted.telegram}
              >
                {tasksCompleted.telegram ? <FaCheck /> : 'Start'}
              </button>
            </li>
          </ul>
          <button
            className="w-full px-4 py-4 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition"
            onClick={handleCompleteTasks}
          >
            Participate Airdrop
          </button>
          {message && <p className="mt-4 text-blue-500 w-full text-center">{message}</p>}
        </div>
      </div>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
    </div>
  );
};

export default Airdrop;
