# Care-Equity
Code2040 Hackathon 2026 – Anonymous Healthcare Bias Tracker

## Live Demo

The app is now live and available at:

- **Frontend:** [https://care-equity.vercel.app](https://care-equity.vercel.app)

### Deployment

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

## Project Structure

This project consists of two main parts:
- **Frontend**: Next.js application with Tailwind CSS
- **Backend**: Node.js/Express API with MongoDB

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB connection string (cloud instance)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=5001
MONGODB_URI=your_mongodb_connection_string_here
NODE_ENV=development
```

4. Replace `your_mongodb_connection_string_here` with your actual MongoDB connection string.

5. Run the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5001`

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
