'use client'
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { spaceSchema } from "@/schema";
import { FormSuccess } from '@/components/form-success';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackgroundGradient } from "./ui/background-gradient";
import Image from "next/image";
import { Loader2 } from "lucide-react";


export const CreateSpace = () => {

    const [isNewSpaceDialogOpen, setIsNewSpaceDialogOpen] = useState(false)
    const [joinSpaceDialogOpen, setJoinSpaceDialogOpen] = useState(false)
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [isPending, startTransition] = useTransition();
    const [id, setId] = useState('');

    const router = useRouter()
    
    const createSpace = async () => {
        const validatedData = spaceSchema.parse({ name, description })


        try {

            const response = await fetch('/api/spaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validatedData),
            });
            const data = await response.json();


            if (!response.ok) {
                throw new Error(data || 'Registration failed');
            }
            if (data?.error) {
                setError(data.error);


            } else {

                setSuccess('space created successfully!');
                router.push(data.updatedSpace.url)
                router.refresh()
            }


        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
            toast.error("An error occured")

        }
    }

    

    async function joinSpace() {
        if(id){

            toast.success("Joining the space");
            router.push(`spaces/${id}`);
        }
        else if(id){
            toast.error("Space not found");
        }
        
    }
    
    return (

        <>
            <div className="flex items-center justify-center mt-10 w-full">

                <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-dark dark:bg-zinc-900">
                    <Image
                        src={`/space-img.jpeg`}
                        alt="jordans"
                        height="400"
                        width="400"
                        className="object-contain"
                    />
                    <h2 className="text-4xl text-purple-400 mt-8 dark:text-neutral-200 text-center">
                        Hola! 
                    </h2>

                    <p className="text-2xl text-pink-800 dark:text-neutral-400 text-center">
                        Lets get you onboard
                    </p>
                    <div className="flex gap-4 mt-8">
                        <Button
                            className="w-full bg-purple-900 text-white hover:bg-purple-700"
                            onClick={() => setIsNewSpaceDialogOpen(true)}
                        >
                            Create
                        </Button>
                        <Button
                            className="w-full bg-purple-900 text-white hover:bg-purple-700"
                            onClick={() => setJoinSpaceDialogOpen(true)}
                        >
                            Join
                        </Button>
                    </div>
                </BackgroundGradient>
            </div>


            <Dialog open={isNewSpaceDialogOpen} onOpenChange={setIsNewSpaceDialogOpen}>
                <DialogContent className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                    <div className="bg-gray-800 text-gray-100 p-6 rounded-lg w-full max-w-md border border-purple-500 shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-purple-400">Create your own space</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <Input
                                required
                                name="name"
                                placeholder="Enter space name"
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                required
                                name="description"
                                placeholder="Enter space description"
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <FormSuccess message={success} />
                            <Button
                                className="w-full bg-purple-600 text-white hover:bg-purple-700 mt-4"
                                disabled={isPending}
                                onClick={() => startTransition(createSpace)}
                            >
                                {isPending ? <Loader2 className="animate-spin" /> : 'Create space'}
                            </Button>

                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={joinSpaceDialogOpen} onOpenChange={setJoinSpaceDialogOpen}>
                <DialogContent className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                    <div className="bg-gray-800 text-gray-100 p-6 rounded-lg w-full max-w-md border border-pink-500 shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-pink-400">Join a Space</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <Input 
                                placeholder="Enter space Id" 
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                value={id}
                                onChange={(e) => setId(e.target.value)}

                            />
                            <Button className="w-full bg-pink-700 text-white hover:bg-pink-600" onClick={() => startTransition(joinSpace)}>
                                {isPending ? <Loader2 className="animate-spin" /> : 'Join space'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}