import './App.css'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from './components/ui/button'
import { useContext } from 'react'
import { TransactionContext } from './context/TransactionContext'

function App() {
  const { connectWallet, getPrice, currentPrice } = useContext(TransactionContext);

  return (
    <div className='h-screen w-screen grid gap-4 grid-cols-3 grid-rows-3'>
      <Card className='w-full'>
        <CardContent>
          <Button className='text-black' onClick={connectWallet}>Connect Wallet</Button>
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardContent>
          <Button className='text-black' onClick={getPrice}>get price</Button>
          <p>{currentPrice}</p>
        </CardContent>
      </Card>
      <Card className='w-full'>
        <CardContent>
          <Button className='text-black'>get token balance</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
