# 🎧 GrooveQ

**GrooveQ** is a real-time collaborative music platform where users create or join spaces to queue, vote, and stream music together. Add songs via YouTube URLs and let the community decide what plays next — democratically through voting or competitively via Solana-powered bets.

---

## 🚀 Features

- **User Authentication** – Secure login with NextAuth.js.
- **Spaces** – Create or join a space with a unique URL or code.
- **Add Songs** – Paste YouTube links to queue tracks (auto-validated).
- **Voting System** – Upvote/downvote songs in the queue.
- **Dynamic Queue** – Highest-voted or highest-bet song plays next.
- **Real-Time Sync** – Live queue updates using WebSockets.
- **Responsive UI** – Fully responsive design for all device sizes.
- **Solana Betting** – Bet SOL (testnet) on your favorite song — winner plays next.

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- React Context API

### Backend
- Next.js API Routes
- PostgreSQL + Prisma ORM
- NextAuth.js v5

### Infrastructure
- WebSockets (real-time communication)
- Vercel (deployment & hosting)

### Blockchain
- Solana testnet (Phantom wallet integration for song betting)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (>= 16.x)
- PostgreSQL
- Git

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/GrooveQ.git
   cd GrooveQ
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=your_postgresql_database_url
     NEXTAUTH_SECRET=your_secret_key
     NEXTAUTH_URL=http://localhost:3000
     ```

4. **Migrate the Database**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to use the app locally.

7. **(Optional) Seed the Database**
   ```bash
   npx prisma db seed
   ```

---

## 🤝 Contributing

We welcome contributions! To report bugs, suggest features, or improve documentation:

1. **Fork** the repository
2. **Create a new branch** (`git checkout -b feature/my-feature`)
3. **Commit and push** your changes
4. **Open a Pull Request**

Before contributing, please check the [Issues](https://github.com/your-username/GrooveQ/issues) tab to avoid duplicates.

---

## 📈 Roadmap

- [ ] Private spaces with invite-only access
- [ ] Playback history & analytics
- [ ] Enhanced Solana wallet integration
- [ ] Mainnet-ready Solana payment support
- [ ] PWA (Progressive Web App) support



