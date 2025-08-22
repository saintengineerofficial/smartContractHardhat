import React, { createContext, useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import { tokenABI, tokenAddress, dexABI, dexAddress } from "@/lib/constants";
import type { Maybe } from "node_modules/@metamask/providers/dist/utils.d.mts";

interface TransactionContextType {
  currentAccount: string;
  currentPrice: number;
  connectWallet: () => Promise<void>;
  checkIfWalletIsConnect: () => Promise<void>;
  getPrice: () => Promise<void>;
  getContractTokenBalance: () => Promise<void>;
  getTokenBalance: () => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType>({
  currentAccount: "",
  currentPrice: 0,
  connectWallet: async () => { },
  checkIfWalletIsConnect: async () => { },
  getPrice: async () => { },
  getContractTokenBalance: async () => { },
  getTokenBalance: async () => { },
});

const createEthereumContract = async () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(tokenAddress, tokenABI, signer);
  const dexContract = new ethers.Contract(dexAddress, dexABI, signer);

  return { contract, dexContract };
};

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  const getPrice = async () => {
    const { dexContract } = await createEthereumContract();
    const price = await dexContract.getPrice(1);
    setCurrentPrice(price);
  };

  const getContractTokenBalance = async () => {
    const { contract } = await createEthereumContract();
    const balance = await contract.balanceOf(contract.address);

    return balance;
  };

  const getTokenBalance = async () => {
    const { dexContract } = await createEthereumContract();
    const balance = await dexContract.getTokenBalance();
    return balance;
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts: Maybe<string[]> = await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("🚀 ~ connectWallet ~ accounts:", accounts);

      setCurrentAccount(accounts?.[0] ?? "");

      window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask.");
      const accounts: Maybe<string[]> = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts?.length) {
        setCurrentAccount(accounts[0] ?? "");
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
    <TransactionContext.Provider value={{ currentAccount, currentPrice, connectWallet, checkIfWalletIsConnect, getPrice, getContractTokenBalance, getTokenBalance }}>
      {children}
    </TransactionContext.Provider>
  );
};

