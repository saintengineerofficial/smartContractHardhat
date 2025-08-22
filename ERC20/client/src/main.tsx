import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import TransactionsProvider from './context/TransactionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <TransactionsProvider>
    <App />
  </TransactionsProvider>,
)
