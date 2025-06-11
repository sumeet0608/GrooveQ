import React from 'react'
import { Button } from './ui/button'

import { logout } from '@/app/action'

function Logout() {
    return (
        <form action={async()=>{
            
            await logout()
            window.location.reload()
          }}>
            <Button variant="outline" className="border-red-900 text-white hover:bg-light-purple/20"
            type='submit'>
                Logout
            </Button>
        </form>
    )
}

export default Logout