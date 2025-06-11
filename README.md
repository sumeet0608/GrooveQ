# GrooveQ

GrooveQ is a collaborative music listening platform where users can create or join spaces to share and enjoy music together. It allows users to add songs via YouTube URLs, maintain a song queue, and vote on songs. The song with the highest votes is played next, ensuring a democratic music experience for all participants.

## Features

### 1. User Authentication
- Users can create an account and log in to access the platform.
- Authentication is implemented using secure, scalable methods.

### 2. Create or Join a Space
- Users can create a new space to start a collaborative music session.
- Other users can join existing spaces by entering a space code or URL.

### 3. Add Songs
- Add songs to the queue by pasting YouTube URLs.
- The platform automatically validates and queues the song.

### 4. Voting System
- Each song in the queue can be upvoted or downvoted.
- Songs with the most votes are prioritized and played next.

### 5. Song Queue Management
- The queue dynamically updates based on votes.
- Users can view the current song and the next in line.

### 6. Real-Time Updates
- Spaces are updated in real-time, ensuring a seamless collaborative experience.

### 7. Responsive Design
- The platform is fully responsive and works smoothly on devices of all sizes.
  
### 8. Solana powered betting system(test net for now)
- Users can bet on their favourite songs in the queue. Betting starts at 0.01 sol. The song with the highest bet in the queue is played next. 

## Tech Stack

### Frontend
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Redux

### Backend
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL (using Prisma ORM)
- **Authentication**: NextAuth.js v5

### Other Tools
- **Real-Time Communication**: WebSockets
- **Hosting**: Vercel (for production deployment)

## Installation and Setup

Follow these steps to set up GrooveQ on your local machine:

### Prerequisites
- Node.js (>= 16.x)
- PostgreSQL database
- Git

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/muspace.git
   cd GrooveQ
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env.local` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=your_postgresql_database_url
     NEXTAUTH_SECRET=your_secret_key
     NEXTAUTH_URL=http://localhost:3000
     ```

4. **Migrate the Database**
   Run the following command to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### Optional: Seed Data
If you have a seed script set up in your Prisma configuration, you can run:
```bash
npx prisma db seed
```

## Contributing
Contributions are welcome! If you find any bugs or have feature suggestions, feel free to open an issue or create a pull request.

### Steps to Contribute
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Open a pull request to the main repository.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

Enjoy using GrooveQ to create and share music collaboratively!

