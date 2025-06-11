'use client'

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/Loading";
import Stream from "@/components/stream";
import { HashLoader } from "react-spinners";
import StreamV2 from "@/components/streamV2";


const Page = ({ params: { spaceId } }: { params: { spaceId: string } }) => {
    
    const [hostId,setCreatorId]=useState<string>();
    const [loading1, setLoading1] = useState(true);


    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const response = await fetch(`/api/spaces/?spaceId=${spaceId}`, {
                    method: 'GET',
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Failed to retreive space's host id");
                }
                setCreatorId(data.space.hostId)
            } catch (error) {
                console.error('Error fetching space:', error);
            }
            finally{
                setLoading1(false)
            }
            
        };
        fetchSpace();
    }, [spaceId]);

    if (loading1) {
        <div className="min-h-screen flex items-center justify-center">
            <HashLoader
              color="white"
              loading={true}
              size={70}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
    }
    return (
        <div className="min-h-screen bg-black text-gray-100">
          <div className="container mx-auto px-4">
            <StreamV2 hostId={hostId as string} playVideo={true} spaceId={spaceId} />
          </div>
        </div>
      )
}
export default Page;
