'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import LoadingScreen from "./Loading";

export const JoinSpace = () => {
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
    const [loading,setLoading] = useState(false)
    const [id, setId] = useState('');
    const router = useRouter();
    async function joinSpace() {
        if(id){
            setLoading(true);
            toast.success("Joining the space");
            router.push(`spaces/${id}`);
        }
        else if(id){
            toast.error("Space not found");
        }
        
    }
    if(loading)
        return <LoadingScreen/>
    return (
        <>
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card className="relative bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-pink-600">Join an Existing Space</CardTitle>
                        <CardDescription className="text-gray-400">Enter a space URL to join friends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full bg-pink-700 text-white hover:bg-pink-600"
                            onClick={() => setIsJoinDialogOpen(true)}
                        >
                            Join Space
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogContent className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-gray-800 text-gray-100 p-6 rounded-lg w-full max-w-md border border-pink-500 shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-pink-400">Join a Space</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <Input 
                                placeholder="Enter space URL" 
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                value={id}
                                onChange={(e) => setId(e.target.value)}

                            />
                            <Button className="w-full bg-pink-700 text-white hover:bg-pink-600" onClick={joinSpace}>
                                Join
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}