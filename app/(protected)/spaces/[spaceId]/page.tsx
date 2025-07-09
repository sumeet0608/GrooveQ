'use client'

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/Loading";
import StreamV2 from "@/components/streamV2";
import { HashLoader } from "react-spinners";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

// Define Video interface consistent with StreamV2
interface Video {
    id: string;
    type: string;
    url: string;
    extractedId: string;
    title: string;
    bigImg: string;
    smallImg: string;
    active: boolean;
    userId: string;
    upvotes: number;
    bidAmount: number;
    haveUpvoted: boolean;
    spaceId: string;
    artist: string;
}

// Define SpaceDataServer interface for initial data passed from server to client
interface SpaceDataServer {
    space: {
        hostId: string;
        spaceName?: string;
        spaceDesc?: string;
        spaceRunning: boolean;
        activeStream: {
            song: Video; // Changed this to be a full Video object
        } | null;
        streams?: Video[]; // The queue of songs
        spaceId: string;
    };
    success: boolean;
    message?: string;
}

const Page = ({ params: { spaceId } }: { params: { spaceId: string } }) => {
    const { data: session, status } = useSession();

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isCreator, setIsCreator] = useState<boolean>(false);
    const [initialSpaceData, setInitialSpaceData] = useState<SpaceDataServer['space'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (status === "unauthenticated") {
            redirect('/auth/login');
            return;
        }

        if (session?.user?.id) {
            setCurrentUserId(session.user.id);

            const fetchSpaceDetails = async () => {
                try {
                    const response = await fetch(`/api/spaces/?spaceId=${spaceId}`, {
                        method: 'GET',
                    });
                    const data: SpaceDataServer = await response.json();

                    if (!response.ok || !data.success) {
                        console.error("Failed to retrieve space's host id:", data.message || "Unknown error");
                        setLoading(false);
                        return;
                    }

                    setInitialSpaceData(data.space);
                    setIsCreator(data.space.hostId === session.user.id);
                } catch (error) {
                    console.error('Error fetching space details:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSpaceDetails();
        }
    }, [session, status, spaceId]);

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
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

    if (!initialSpaceData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500">
                <h1 className='text-4xl'>Error: Space not found or failed to load.</h1>
                <Link href="/dashboard">
                    <Button className="mt-4 bg-purple-600 text-white hover:bg-purple-700">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100">
            <div className="container mx-auto px-4">
                <StreamV2
                    spaceId={spaceId}
                    currentUserId={currentUserId as string}
                    initialIsCreator={isCreator}
                    initialSpaceData={initialSpaceData}
                />
            </div>
        </div>
    );
}

export default Page;