# Recipe AI - Backend Server

Node.js/Express API backend for the Recipe AI application.

## Features

- User authentication (JWT)
- Recipe management with AI integration
- MongoDB database integration
- CORS enabled for cross-origin requests
- Health check endpoint

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (for database)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/recipe-ai?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_12345
```

## Running Locally

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server status
- `GET /` - Welcome message

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Recipes
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get recipe by ID
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Deployment on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set root directory: leave blank (use root)
6. Set environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to `production`
   - `PORT` - Keep as `10000` (Render default)
7. Deploy

## Database Setup

Create a free MongoDB cluster:

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account
3. Create a cluster
4. Create database user
5. Get connection string
6. Add to `.env` as `MONGODB_URI`

## Project Structure

```
server/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, etc.)
├── models/         # MongoDB schemas
├── routes/         # API routes
├── server.js       # Entry point
├── package.json    # Dependencies
└── .env            # Environment variables (not in git)
```

## Technologies

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Development

- Use `npm run dev` for live reloading with nodemon
- API runs on port 5000 in development
- API runs on port defined by Render in production

## License

MIT
