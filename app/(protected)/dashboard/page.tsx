'use client'

import { GiSpaceship } from "react-icons/gi";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/button";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { Spotlight } from "@/components/ui/spotlight-new";
import { StarsBackground } from "@/components/ui/stars-background";
import { WavyBackground } from "@/components/ui/wavy-background";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { HashLoader } from 'react-spinners';
import { toast } from "sonner";
import { Cover } from "@/components/ui/cover";
import ColourfulText from "@/components/ui/colourful-text";
import { CreateSpace } from "@/components/create-space-component";
import { ExistingSpace } from "@/components/existing-space";

interface SpaceData {
    space: {
        name: string,
        description: string,
        hostId: string
    }
}
interface SpaceId {
    spaceId: string
}



export default function Dashboard() {
    const [spaceId, setSpaceId] = useState<SpaceId>();
    const [space, setSpace] = useState(false)
    const [spacedata, setSpacedata] = useState<SpaceData>()
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition();
    const router = useRouter()

    async function endSpace() {
        try {
            const id = spaceId?.spaceId
            console.log(id);

            const res = await fetch(`/api/streams`, {
                method: "DELETE",
                body: JSON.stringify({ spaceId: id }),
            });

            if (res.ok) {
                toast.success("Stream ended successfully");
                window.location.reload();

            } else {
                throw new Error('Failed to end stream');
            }
        } catch (error) {
            console.error("Error ending stream:", error);
            toast.error("Failed to end stream");
        } finally {
            router.refresh()
        }
    }

    const fetchSpace = async () => {
        setLoading(true)  // Start loading when we begin fetching
        try {
            const res = await fetch(`/api/getSpaceId`)
            const sp = await res.json()
            if (sp.success === true) {
                setSpaceId(sp)
                setSpace(true)

            } else {

                setLoading(false)
            }
        } catch (error) {
            console.error("Error fetching space:", error)
            setLoading(false)
        }
    }

    const fetchSpaceData = async () => {
        if (!spaceId) return;

        setLoading(true)
        try {
            const res = await fetch(`/api/spaces/?spaceId=${spaceId.spaceId}`)
            const data = await res.json()
            // console.log(data);

            if (data.success === true) {
                setSpacedata(data)
            }
        } catch (error) {
            console.error("Error fetching space data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSpace()
    }, [])

    useEffect(() => {

        if (space) {
            fetchSpaceData()
        }
    }, [space, spaceId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <HashLoader
                    color="white"
                    loading={true}
                    size={70}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
        );
    }
    return (
        <WavyBackground containerClassName="h-auto" className="max-w-4xl mx-auto pb-40">

        <div className="flex flex-col min-h-screen text-gray-100 mt-24">

            <div className="flex-1 flex flex-col items-center md:p-6 relative">
                
                <div className="w-full items-center justify-center">
                    <h1 className="text-4xl font-bold  text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">

                        Welcome to the {" "}
                        <Cover className="text-4xl">
                            <ColourfulText text="GrooveQ" />
                        </Cover>
                        <span className="ml-2"> Station </span>
                        <Image src="/ufo.png" alt="spaceship" width={50} height={50} className="inline-block" />
                        <br />

                    </h1>
                </div>

                

                {!space && !spacedata &&

                    <main className="w-full max-w-4xl space-y-6 flex flex-col items-center justify-center min-h-4">


                        <CreateSpace />

                        
                    </main>

                }
                
                {space && spacedata &&
                    <h1 className="text-3xl font-bold text-pink-800 mt-4">
                        Captain, you've an ongoing GrooveQ Space!
                    </h1>
                }

                {space && spacedata &&
                
                       <ExistingSpace spacedata={spacedata} spaceId={spaceId as SpaceId}/>

                }
            </div>
        </div>
        </WavyBackground>
    )
}


