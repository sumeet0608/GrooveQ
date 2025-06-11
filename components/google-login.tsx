

import React from 'react'
import { Button } from './ui/button';
import { FcGoogle } from 'react-icons/fc';
import { googleLogin } from '@/app/action';

export default function GoogleAuth() {
  return (
    <div className='w-full'>
        <form className="flex items-center w-full gap-x-2"
          action={async()=>{
            
            await googleLogin()

          }}
        >

            <Button size="lg" className="w-full hover:bg-white" variant={"outline"} type="submit">
              <FcGoogle className="h-5 w-5" />
            </Button>
        </form>
    </div>
  )
}
