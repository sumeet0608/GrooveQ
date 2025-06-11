import { Button } from "@/components/ui/button";
import { Music2, Users, UserPlus, Vote, HandCoins, ArrowUp, ArrowDown, Play, Wallet } from "lucide-react";

import FloatingNavbar from "@/components/FloatingNavbar";
import FeatureCard from "@/components/ui/feature-card";
import MusicVisualizer from "@/components/ui/music-visualiser";
import HowItWorksStep from "@/components/how-it-works";
import Link from "next/link";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { Cover } from "@/components/ui/cover";
import Image from "next/image";

const Features = [
  {
    title: "Create Your Space",
    description: "Set up your personalized music room and customize it to match your vibe.",
    icon: <Music2 size={24} className="text-light-purple" />
  },
  {
    title: "Invite Friends",
    description: "Bring your crew into your space and enjoy music together in real-time.",
    icon: <UserPlus size={24} className="text-light-purple" />
  },
  {
    title: "Vote on Songs",
    description: "Democracy in action — vote for the tracks you want to hear next.",
    icon: <Vote size={24} className="text-light-purple" />
  },
  {
    title: "Solana Bidding",
    description: "Use Solana to bid on songs and guarantee they play next in the queue.",
    icon: <Image alt="" src="/solana.png" width={50} height={50} className="text-light-purple" />
  },
  {
    title: "Music Discovery",
    description: "Discover new tracks from friends and expand your musical horizons.",
    icon: <Play size={24} className="text-light-purple" />
  },
  {
    title: "Community Powered",
    description: "Build a community around your favorite music and musical tastes.",
    icon: <Users size={24} className="bg-transparent" />
  }
];

const Index = () => {
  return (
    <div className="min-h-screen w-full ">
      <FloatingNavbar />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden bg-black">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-pattern opacity-10 bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-radial from-light-purple/10 via-transparent to-transparent"></div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-block">
              <div className="flex items-center px-4 py-1 rounded-full bg-solana/20 text-solana text-sm font-medium">
                <Image src="/solana.png" alt="Solana" width={32} height={32} className="w-8 h-8 mr-2" />
                <span className="text-purple-300">Powered by Solana</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight mt-8">
              Social Music <br />

              <Highlight className="text-glow text-dark  dark:text-white">
                Redefined
              </Highlight>

            </h1>

            <p className="text-2xl text-gray-300 mb-8 mt-8">
              Create your space, invite friends, and let the crowd choose the soundtrack through voting and Solana-powered bidding.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link href={'/dashboard'}>

                <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Create Space
                  </span>
                </button>
              </Link>
              
            </div>
          </div>

          <div className="mt-16 mb-16">
            <MusicVisualizer />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative bg-dark-pruple">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-3xl md:text-4xl font-bold mb-4 text-white">
              <span className="mr-2">Features that</span>
              <Cover className="text-4xl text-dark-purple"><span className="text-light-purple">Drop the Beat</span></Cover>
            </span>
            <p className="text-gray-300 max-w-2xl mx-auto">A revolutionary platform where music meets community and blockchain technology.</p>
          </div>


          <HoverEffect items={Features} />
        </div>
        <ShootingStars />
        <StarsBackground />
      </section>


      <section id="how-it-works" className="py-24 bg-black">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How <span className="text-light-purple">It Works</span></h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Simple steps to get started with our music platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <HowItWorksStep
              number={1}
              title="Create a Space"
              description="Sign up and create your personalized music room in just a few clicks."
              icon={<Music2 size={18} />}
            />
            <HowItWorksStep
              number={2}
              title="Connect Your Wallet"
              description="Link your Solana wallet to enable bidding on songs."
              icon={<Wallet size={18} />}
            />
            <HowItWorksStep
              number={3}
              title="Add Your Playlist"
              description="Upload your favorite songs or link your existing playlists."
              icon={<Music2 size={18} />}
            />
            <HowItWorksStep
              number={4}
              title="Invite Friends"
              description="Share your unique room code with friends to join the session."
              icon={<UserPlus size={18} />}
            />
            <HowItWorksStep
              number={5}
              title="Vote & Bid"
              description="Vote for songs or use Solana to bid on your favorites to play next."
              icon={<Vote size={18} />}
            />
            <HowItWorksStep
              number={6}
              title="Enjoy Together"
              description="Listen to music in real-time with your friends and community."
              icon={<Users size={18} />}
            />
          </div>

          <div className="mt-16 max-w-sm mx-auto glass p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Queue System</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-light-purple/20 rounded-full flex items-center justify-center mr-3">
                    <HandCoins size={18} className="text-light-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Highest Bid Priority</p>
                    <p className="text-sm text-gray-400">Songs with bids play first</p>
                  </div>
                </div>
                <ArrowUp size={20} className="text-solana" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-light-purple/20 rounded-full flex items-center justify-center mr-3">
                    <Vote size={18} className="text-light-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Most Voted Next</p>
                    <p className="text-sm text-gray-400">If no bids, highest votes win</p>
                  </div>
                </div>
                <ArrowDown size={20} className="text-light-purple" />
              </div>
            </div>
          </div>
        </div>
        <ShootingStars />
        <StarsBackground />
      </section>


      <footer className="py-10 border-gray-800 bg-black">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-center items-center">

            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} GrooveQ. All rights reserved. Powered by Solana.
            </div>
          </div>
        </div>
      </footer>

      <ShootingStars />
      <StarsBackground />
    </div>
  );
};

export default Index;
