
import Link from 'next/link'


export default function Footer() {
  return (



    <footer className="border-t mt-8 py-4 bg-gray-900">
           <div className="container mx-auto flex justify-between items-center">
          <p className="text-xs text-gray-400">© 2024 MusicSpace. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link
              className="text-xs  text-gray-400 hover:text-purple-400 transition-colors"
              href="/terms-of-service"
              aria-label="Terms of Service"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
              href="/privacy-policy"
              aria-label="Privacy Policy"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>

  )
}

// import Link from "next/link"
// import React from 'react'

// const Footer = () => {
//   return (
//     <footer className="absolute bottom-0 left-0 right-0 border-t bg-gray-900 border-gray-600">
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 px-4 md:px-6 max-w-7xl mx-auto w-full">
//         <p className="text-xs text-gray-500 dark:text-gray-400">
//           © {new Date().getFullYear()} EduCrate. All rights reserved.
//         </p>
//         <nav className="flex gap-4 sm:gap-6">
//           <Link 
//             className="text-xs text-gray-500 dark:text-gray-400 hover:underline underline-offset-4 transition-all" 
//             href="/terms"
//           >
//             Terms of Service
//           </Link>
//           <Link 
//             className="text-xs text-gray-500 dark:text-gray-400 hover:underline underline-offset-4 transition-all" 
//             href="/privacy"
//           >
//             Privacy
//           </Link>
//         </nav>
//       </div>
//     </footer>
//   )
// }

// export default Footer