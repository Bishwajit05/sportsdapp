import React, { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const Profile = () => {
  const { account, isConnected, connectWallet } = useContext(Web3Context);
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">My Wallet</h1>
          <p className="text-gray-600 mb-8">Connect your wallet to view your profile</p>
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center w-full max-w-2xl">
        <div className="mb-8">
          <div className="bg-blue-100 text-blue-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">My Wallet</h2>
          <p className="text-gray-600 font-mono break-words px-4">{account}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;