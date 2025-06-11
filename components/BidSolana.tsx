"use client"
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';


export default function BidSolana({ songId, spaceId,refresh }: { songId: string, spaceId: string,refresh: () => Promise<void> }) {


  const { publicKey, wallet, sendTransaction } = useWallet()
  const [isPending, startTransition] = useTransition();

  const DEVNET_URL = process.env.NEXT_PUBLIC_DEVNET_URL;
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_PUBLIC_KEY;

  if (!DEVNET_URL || !PUBLIC_KEY) {
    throw new Error("Missing environment variables");
  }
  const connection = new Connection(DEVNET_URL);
  const GOVERNANCE_ADDRESS = new PublicKey(PUBLIC_KEY );




  const [newAmount, setNewAmount] = useState<number>()

  useEffect(() => {
    getHighestBid()
  }, [])



  async function bidSol() {
    
    if (!wallet || !publicKey) {
      return toast.error("Please connect your wallet");
    }

    try {
      if (!newAmount) {
        return toast.error("Bid not found")
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: GOVERNANCE_ADDRESS,
          lamports: newAmount * LAMPORTS_PER_SOL
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);

      const status = await connection.getSignatureStatus(signature);
      console.log(status);


      if (status?.value?.err) {
        throw new Error;
      }
      toast.success('Transaction sent successfully!');

      await submit()
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed');
    }
  }

  async function submit() {
    console.log(songId);
    console.log(newAmount);



    const res = await fetch(`/api/solana`, {
      method: "POST",
      headers: { 'content-type': "application/json" },
      body: JSON.stringify({ songId, newAmount })
    })
    const data = await res.json()

    if (!res.ok) {
      console.log(data);

    }

    await getHighestBid()
    
    await refresh();

  }

  async function getHighestBid() {

    const res = await fetch(`/api/solana?spaceId=${spaceId}`)
    console.log(res);
    
    const data = await res.json()
    console.log(typeof(data),data);
    
    const bid = Number(data) + 0.001
    if(data == 0)
      setNewAmount(0.001)
    else
      setNewAmount(bid)
  }



  return (
    <div className="flex gap-2 relative group cursor-pointer">
      <Button className='w-full mx-2 my-2 bg-purple-950 hover:bg-purple-900' onClick={()=>{
        startTransition(async() => {
          await bidSol()
        })
      }}> 
      {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : `bid: ${newAmount} sol`}
      </Button>

      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm text-white bg-gray-800 px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
        bid: {newAmount} SOL
      </div>
    </div>
  )

}
