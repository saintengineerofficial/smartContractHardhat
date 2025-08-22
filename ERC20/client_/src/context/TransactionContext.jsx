import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { tokenABI, tokenAddress, dexABI, dexAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, tokenABI, signer);
  const dexContract = new ethers.Contract(dexAddress, dexABI, signer);

  return { contract, dexContract };
};

const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  const getPrice = async () => {
    const { dexContract } = createEthereumContract();
    const price = await dexContract.getPrice(1);
    setCurrentPrice(price);
  };

  const getContractTokenBalance = async () => {
    const { contract } = createEthereumContract();
    const balance = await contract.balanceOf(contract.address);

    return balance;
  };

  const getTokenBalance = async () => {
    const { dexContract } = createEthereumContract();
    const balance = await dexContract.getTokenBalance();
    return balance;
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("🚀 ~ connectWallet ~ accounts:", accounts);

      setCurrentAccount(accounts[0]);

      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  return (
    <TransactionContext.Provider value={ { currentAccount, currentPrice, connectWallet, checkIfWalletIsConnect, getPrice, getContractTokenBalance, getTokenBalance } }>
      { children }
    </TransactionContext.Provider>
  );
};

export default TransactionsProvider;
