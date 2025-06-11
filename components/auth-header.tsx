'use server'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { auth } from '@/auth'

export default async function authHeader() {

    const session = await auth();
    
    return (
        <>
             <Link href="/auth/login">
                <Button variant="outline" className="border-light-purple text-light-purple hover:bg-light-purple/20">
                Log in
                </Button>
            </Link>
            <Button className="bg-light-purple hover:bg-light-purple/80 text-white">
                <svg width="16" height="16" viewBox="0 0 128 114" className="mr-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M45.7 3.9L3.8 80.6c-3.6 6.7 1 15.1 8.7 15.1h83.3c3.3 0 6.3-1.8 7.9-4.6l23.6-41.6c4-7.1-6.1-14.4-11.2-8.1L81.7 84.9l12.3-76.2c1-6.1-7.5-9.1-10.8-3.8L45.7 61.8l9.2-50.8c1.1-6-7.3-9.1-10.6-3.8l1.4-3.3z" 
                    fill="currentColor"/>
                </svg>
                Connect Wallet
            </Button>
        </>
    )
}

