import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-center text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-500'>
        About GrooveQ
      </h1>

      <Card className="mb-8 bg-gray-900 border-2 border-gradient-to-r from-purple-400 to-red-500">
        <CardContent className="pt-6">
          <p className='text-center text-xl text-white'>
          GrooveQ is a collaborative music listening platform where users can create or join spaces to share and enjoy music together. It allows users to add songs via YouTube URLs, maintain a song queue, and vote on songs. The song with the highest votes is played next, ensuring a democratic music experience for all participants.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-gray-900 border-2 border-gradient-to-r from-purple-400 to-red-500">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text bg-gradient-to-r text-transparent from-purple-400 to-red-500">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "User Authentication", description: "Users can create an account and log in to access the platform. Authentication is implemented using secure, scalable methods." },
              { title: "Create or Join a Space", description: "Users can create a new space to start a collaborative music session. Other users can join existing spaces by entering a space code or URL." },
              { title: "Add Songs", description: "Add songs to the queue by pasting YouTube URLs. The platform automatically validates and queues the song." },
              { title: "Voting System", description: "Each song in the queue can be upvoted or downvoted. Songs with the most votes are prioritized and played next." },
              { title: "Song Queue Management", description: "The queue dynamically updates based on votes. Users can view the current song and the next in line." },
              { title: "Real-Time Updates", description: "Spaces are updated in real-time, ensuring a seamless collaborative experience." },
              { title: "Responsive Design", description: "The platform is fully responsive and works smoothly on devices of all sizes." },
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-900 border border-gradient-to-r from-purple-400 to-red-500">
                <CardHeader>
                  <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-2 border-gradient-to-r from-purple-400 to-red-500">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text bg-gradient-to-r text-transparent from-purple-400 to-red-500">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gray-900 border border-gradient-to-r from-purple-400 to-red-500">
              <CardHeader>
                <CardTitle className="text-white">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-white">
                  <li><strong>Framework:</strong> Next.js</li>
                  <li><strong>Styling:</strong> Tailwind CSS</li>
                  <li><strong>State Management:</strong> React Context API / Redux</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-gradient-to-r from-purple-400 to-red-500">
              <CardHeader>
                <CardTitle className="text-white">Backend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-white">
                  <li><strong>Framework:</strong> Next.js API Routes</li>
                  <li><strong>Database:</strong> PostgreSQL (using Prisma ORM)</li>
                  <li><strong>Authentication:</strong> NextAuth.js v5</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border border-gradient-to-r from-purple-400 to-red-500">
              <CardHeader>
                <CardTitle className="text-white">Other Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-white">
                  <li><strong>Real-Time Communication:</strong> WebSockets</li>
                  <li><strong>Hosting:</strong> Vercel (for production deployment)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

