import { useContext } from "react";
import { TransactionContext } from "./context/TransactionContext";

const App = () => {
  const { currentAccount, currentPrice, connectWallet, checkIfWalletIsConnect, getPrice, getContractTokenBalance, getTokenBalance } = useContext(TransactionContext);

  return (
    <div className="min-h-screen grid grid-cols-5">
      <button onClick={ connectWallet }>Connect Wallet</button>
      <div>{ currentAccount || 'empty' }</div>
      <button onClick={ getPrice }>Get Price</button>
      <div>{ currentPrice || 'empty' }</div>
      <button onClick={ getContractTokenBalance }>Get Contract Token Balance</button>
      <button onClick={ getTokenBalance }>Get Token Balance</button>
    </div>
  );
};

export default App;
