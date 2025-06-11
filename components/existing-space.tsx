import Image from "next/image"
import { BackgroundGradient } from "./ui/background-gradient"
import { startTransition, useState, useTransition } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

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



export const ExistingSpace = ({spacedata,spaceId}:{spacedata:SpaceData,spaceId:SpaceId}) => {



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
                throw new Error('Failed to end space');
            }
        } catch (error) {
            console.error("Error ending stream:", error);
            toast.error("Failed to end stream");
        } finally {
            router.refresh()
        }
    }

  return (
  <div className="mt-10">
    <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-dark dark:bg-zinc-900">
        <Image
            src={`/music_space.webp`}
            alt="jordans"
            height="400"
            width="400"
            className="object-contain"
        />
        <h2 className="text-4xl text-purple-400 mt-8 dark:text-neutral-200">
            {spacedata?.space?.name}
        </h2>

        <p className="text-2xl text-white dark:text-neutral-400">
            {spacedata?.space?.description}
        </p>
        <div className="flex gap-4 mt-8">
            {!isPending &&
                <Button onClick={() => {
                    startTransition(() => {
                        router.push(`/spaces/${spaceId?.spaceId}`)
                    })
                }} className="w-full bg-purple-600 text-white hover:bg-purple-700">
                    Join Space
                </Button>}
            {!isPending ?   
                (<Button onClick={endSpace} className="w-full bg-red-700 text-white hover:bg-red-900">
                    End Space
                </Button>):
            (<Button className="w-full bg-purple-800"><LoaderCircle color="white" className="animate-spin" /></Button>)}
        </div>
    </BackgroundGradient>
</div>
  )
}

