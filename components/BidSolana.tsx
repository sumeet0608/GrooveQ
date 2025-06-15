"use client"
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useEffect, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';


interface BidSolanaProps {
  songId: string;
  spaceId: string;
  refresh: () => Promise<void>;
  currentHighestBidInSpace: number; // New prop for the highest bid in the entire space
}

export default function BidSolana({ songId, spaceId, refresh, currentHighestBidInSpace }: BidSolanaProps) {

  const { publicKey, wallet, sendTransaction } = useWallet()
  const [isPending, startTransition] = useTransition();

  const DEVNET_URL = process.env.NEXT_PUBLIC_DEVNET_URL;
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_PUBLIC_KEY;

  if (!DEVNET_URL || !PUBLIC_KEY) {
    throw new Error("Missing environment variables");
  }
  const connection = new Connection(DEVNET_URL);
  const GOVERNANCE_ADDRESS = new PublicKey(PUBLIC_KEY);

  // Derive the bid amount directly from the prop
  // The minimum bid should be the highest bid in the space + 0.001 SOL
  // Use a state to hold this value, and update it when the prop changes
  const [newAmount, setNewAmount] = useState<number>(0.001); // Initialize with default

  // Update newAmount whenever currentHighestBidInSpace prop changes
  useEffect(() => {
    const updatedBid = currentHighestBidInSpace === 0 ? 0.001 : currentHighestBidInSpace + 0.001;
    setNewAmount(updatedBid);
  }, [currentHighestBidInSpace]); // Dependency array ensures this runs when prop changes


  async function bidSol() {
    
    if (!wallet || !publicKey) {
      return toast.error("Please connect your wallet");
    }

    try {
      // Ensure newAmount is valid before sending transaction
      if (newAmount <= 0) {
        return toast.error("Bid amount must be greater than zero.");
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
        // More specific error for failed Solana transaction
        throw new Error("Solana transaction failed. Please check your wallet.");
      }
      toast.success('Transaction sent successfully!');

      await submit(); // Proceed to update the database
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed: ' + (error instanceof Error ? error.message : "An unknown error occurred"));
    }
  }

  async function submit() {
    console.log("Submitting bid for song:", songId, "with amount:", newAmount);

    const res = await fetch(`/api/solana`, {
      method: "POST",
      headers: { 'content-type': "application/json" },
      body: JSON.stringify({ songId, newAmount }) // Send the bid amount that was just sent via Solana
    })
    const data = await res.json()

    if (!res.ok) {
      console.error("Failed to update bid on server:", data);
      toast.error(data.message || "Failed to update bid on server");
    } else {
      toast.success("Bid successfully recorded!");
    }
    
    await refresh();
  }

  return (
    <div className="flex gap-2 relative group cursor-pointer">
      <Button className='w-full mx-2 my-2 bg-purple-950 hover:bg-purple-900' onClick={()=>{
        startTransition(async() => {
          await bidSol()
        })
      }}> 
      {/* Display newAmount formatted to a fixed number of decimal places for cleaner UX */}
      {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : `bid: ${newAmount.toFixed(3)} sol`}
      </Button>

      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm text-white bg-gray-800 px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
        Minimum required bid: {newAmount.toFixed(3)} SOL
      </div>
    </div>
  )
}