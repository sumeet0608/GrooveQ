'use client'
import { LogOut, Share2 } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import WalletIcon from './wallet-icon';
import Link from 'next/link';


interface SpaceData {
  spaceName?: string;
  spaceDesc?: string;
  isCreator: boolean
  spaceId: string
}


export const SpaceHeader = ({ data }: { data?: SpaceData }) => {

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  function shareVideo() {
    const shareableLink = `${data?.spaceId}`;
    navigator.clipboard.writeText(shareableLink)
      .then(() => toast.success('Id copied to clipboard!'))
      .catch((err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy link. Please try again.');
      });
  }

  async function endStream() {
    try {
      const spaceId = data?.spaceId;
      const res = await fetch(`/api/streams`, {
        method: "DELETE",
        body: JSON.stringify({ spaceId }),
      });

      if (res.ok) {
        toast.success("Stream ended successfully");
        router.refresh()
        router.push('/dashboard')

      } else {
        throw new Error('Failed to end stream');
      }
    } catch (error) {
      console.error("Error ending stream:", error);
      toast.error("Failed to end stream");
    }
  }

  function handleEndSpaceClick() {
    setShowConfirmModal(true);
  }

  function handleConfirmEndSpace() {
    setShowConfirmModal(false);
    endStream();
  }

  function handleCancelEndSpace() {
    setShowConfirmModal(false);
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-5xl text-glow md:text-6xl capitalize font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {data?.spaceName}
        </h1>
        
        <p className="text-gray-400 text-2xl md:text-3xl">{data?.spaceDesc}</p>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <WalletIcon />
      
        <Button
          variant="outline"
          className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-gray-900"
          onClick={shareVideo}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        {data?.isCreator && (
          <Button
            onClick={handleEndSpaceClick}
            variant="outline"
            className="bg-red-900 text-white hover:bg-red-900/80 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            End Space
          </Button>
        )}
        {!data?.isCreator && (
          <Button
            variant="outline"
            className="bg-red-900 text-white"
            onClick={() => {
              router.push("/dashboard")
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Leave Space
          </Button>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-md shadow-md text-center">
            <h2 className="text-xl font-bold text-white">Are you sure you want to end the space?</h2>
            <div className="mt-4 flex justify-center space-x-4">
              <Button onClick={handleConfirmEndSpace} className="bg-red-600 text-white hover:bg-red-700">
                Yes, End Space
              </Button>
              <Button onClick={handleCancelEndSpace} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
