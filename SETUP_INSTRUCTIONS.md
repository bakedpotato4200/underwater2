# Underground Water 2 - Setup Instructions

## What's Included
This zip file contains the complete Underground Water 2 budgeting application:
- **backend/** - Express.js server with MongoDB integration
- **frontend/** - Vanilla JavaScript ES6 modules UI
- **replit.md** - Full project documentation

## Quick Start

### Step 1: Extract the zip file
```bash
unzip Underground-Water-2.zip
cd Underground-Water-2
```

### Step 2: Install dependencies (Backend)
```bash
cd backend
npm install
```

### Step 3: Set up environment variables
Create a `.env` file in the `backend/` directory with:
```
MONGO_URI=mongodb+srv://YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

Get MongoDB Atlas free account: https://www.mongodb.com/cloud/atlas

### Step 4: Start the server
```bash
npm start
```

The app will be available at: **http://localhost:5000**

## Features
✅ User authentication (signup/login with JWT)
✅ Dashboard with monthly budget summary
✅ Calendar view with daily balance projections
✅ Recurring items management (income/expenses)
✅ Settings for paycheck and starting balance configuration
✅ Real-time balance calculations

## Project Structure
```
backend/
  ├── server.js              # Main Express server
  ├── routes/                # API endpoints
  ├── models/                # MongoDB schemas
  ├── middleware/            # Authentication
  ├── utils/                 # Calendar engine
  └── package.json

frontend/
  ├── index.html             # Main app
  ├── styles.css             # Styling
  └── js/
      ├── main.js            # Entry point
      ├── auth.js            # Auth logic
      ├── dashboard.js       # Dashboard view
      ├── calendar.js        # Calendar view
      ├── recurring.js       # Recurring items
      ├── settings.js        # Settings view
      ├── api.js             # API calls
      ├── config.js          # Configuration
      └── ui.js              # View management
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Calendar
- `GET /api/calendar/month?year=2025&month=11` - Monthly projection
- `GET /api/calendar/year?year=2025` - Year forecast

### Recurring Items
- `GET /api/recurring` - List items
- `POST /api/recurring` - Create item
- `PUT /api/recurring/:id` - Update item
- `DELETE /api/recurring/:id` - Delete item

### Settings
- `GET /api/paycheck-settings` - Get paycheck config
- `POST /api/paycheck-settings` - Set paycheck config
- `GET /api/starting-balance` - Get balance
- `POST /api/starting-balance` - Set balance

## Deployment

### On Replit
1. Create a new Replit project
2. Extract this zip into the project
3. Create `.env` with your MongoDB URI and JWT secret
4. Create a workflow: `npm start --prefix backend`
5. Click "Publish" to deploy

### On Local Machine
1. Extract the zip
2. Install Node.js (https://nodejs.org)
3. Follow "Quick Start" steps above

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` in the backend directory
- Make sure you're in the correct directory

**"MongoDB connection failed":**
- Check your MONGO_URI in .env is correct
- Ensure MongoDB Atlas cluster is active
- Whitelist your IP address in MongoDB Atlas

**"Port 5000 already in use":**
- Change PORT in .env to 3000 or 8000
- Or kill the process using port 5000

## Need Help?
Check `replit.md` for detailed project documentation and architecture decisions.

---
Built with Express.js, MongoDB, and Vanilla JavaScript
