"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AudioWaveform } from "lucide-react";
import Link from "next/link";

import { toast } from "sonner";
import { fetchUser } from "@/app/action";
import Logout from "./Logout";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
}

const FloatingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  console.log("pathname", pathname);
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const user = await fetchUser()
      console.log("user", user);
      
      setUser(user as User);
    };
    getSession();
  }, []);
  
  
  if(pathname.startsWith("/spaces")) 
    return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mx-4 mt-4
        ${
        isScrolled 
          ? "bg-gray-900/50 backdrop:blur p-2 rounded-3xl" 
          : "rounded-2xl"
      }`
      }
    >
      <div className="container flex items-center justify-between px-4">
        <Link href={"/"}>
        <div className="flex items-center space-x-2">
          <AudioWaveform className="h-6 w-6 text-purple-700" />
          <span className="text-xl font-bold text-white">GrooveQ</span>
        </div>
        </Link>
        <div className="hidden md:flex items-center justify-center gap-3 ml-20 space-x-6">
          {!user || pathname === "/" && (
            <>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it works</a>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="outline" className="border-light-purple text-light-purple hover:bg-light-purple/20">
                  Log in
                </Button>
              </Link>
              <Button className="bg-solana/20 hover:bg-light-purple/80 text-white"
                onClick={()=>{
                  toast.error('Please Login/Register to Connect Wallet')
                }}>
                <Image src="/solana.png" alt="solana"  width={32} height={32}className="mr-2"/>
                Connect Wallet
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-3">

              <Link href="/dashboard">
                <Button variant="outline" className="border-purple-900 text-white hover:bg-light-purple/20">
                  Spaces
                </Button>
              </Link>
              <Logout />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingNavbar;


