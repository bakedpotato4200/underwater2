# Underground Water 2 - Complete Project Documentation

## Project Overview
A paycheck-to-paycheck budgeting web application for managing recurring income/expenses, tracking balance projections, and identifying financial pressure points. Built with Express/MongoDB backend and vanilla JavaScript frontend.

## Current Status: ✅ FULLY FUNCTIONAL

All core features are implemented and working:
- ✅ User authentication (signup/login with JWT)
- ✅ Dashboard with monthly budget summary
- ✅ Calendar view with daily balance projections
- ✅ Recurring items management (income/expenses)
- ✅ Settings (paycheck configuration, starting balance)
- ✅ MongoDB Atlas database integration
- ✅ Unified Express server (frontend + API on port 5000)
- ✅ Deployable on both Replit and local environments with Git

## Architecture

### Backend (Express/Node.js)
- **Port**: 5000
- **Database**: MongoDB Atlas with Neon backing
- **Authentication**: JWT with bcrypt password hashing
- **Structure**:
  - `server.js` - Main server with unified frontend serving
  - `routes/` - API endpoints for auth, calendar, recurring, settings, etc.
  - `models/` - MongoDB schemas (User, PaycheckSettings, StartingBalance, Recurring, etc.)
  - `middleware/auth.js` - JWT verification middleware
  - `utils/calendarEngine.js` - Advanced calendar projection logic

### Frontend (Vanilla JavaScript ES6 Modules)
- **Port**: 5000 (served by Express)
- **Structure**:
  - `index.html` - Main app shell with all views
  - `js/main.js` - Entry point (imports all modules)
  - `js/auth.js` - Authentication logic
  - `js/api.js` - API wrapper functions
  - `js/config.js` - Configuration and helpers
  - `js/ui.js` - View management
  - `js/dashboard.js` - Dashboard view
  - `js/calendar.js` - Calendar grid rendering
  - `js/recurring.js` - Recurring items management
  - `js/settings.js` - Settings management
  - `styles.css` - Application styling

## Key Features

### Authentication
- User registration with email/password
- Secure JWT tokens (30-day expiration)
- Automatic user data initialization on signup
- Token persistence in localStorage

### Dashboard
- Monthly budget summary (starting balance, income, expenses, ending balance)
- Lowest/highest balance for the month
- Pressure points (top 3 highest expense days)
- Real-time calculations from backend

### Calendar
- Full month grid view of budget projections
- Daily balance tracking
- Income/expense event display
- Month navigation (prev/next)
- Summary totals (income, expenses, net)

### Recurring Items
- Add/edit/delete recurring income and expenses
- Frequency options: weekly, biweekly, monthly
- Type selection: income or expense
- Amount and start date configuration

### Settings
- Configure starting balance
- Paycheck settings (amount, frequency, start date)
- Automatic default initialization for new users

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify JWT token

### Calendar
- `GET /api/calendar/month?year=2025&month=11` - Get monthly projection
- `GET /api/calendar/year?year=2025` - Get 12-month forecast

### Recurring Items
- `GET /api/recurring` - List all recurring items
- `POST /api/recurring` - Create recurring item
- `PUT /api/recurring/:id` - Update recurring item
- `DELETE /api/recurring/:id` - Delete recurring item

### Settings
- `GET /api/starting-balance` - Get starting balance
- `POST /api/starting-balance` - Set starting balance
- `GET /api/paycheck-settings` - Get paycheck settings
- `POST /api/paycheck-settings` - Set paycheck settings

## Environment Variables
```
MONGO_URI=mongodb+srv://[user]:[password]@cluster.mongodb.net/?appName=[app]
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=5000
```

## Deployment Configuration

### Replit
- Backend and frontend unified on port 5000
- MongoDB Atlas for database persistence
- Git as central repository
- Workflows configured for automatic startup

### Local Development
- Run `npm install` in backend directory
- Set environment variables
- Run `npm start` to start server
- Frontend accessible at `http://localhost:5000`

## Calendar Engine Details

The advanced calendar engine (`calendarEngine.js`) provides:
- Recurring item occurrence generation (weekly/biweekly/monthly)
- Daily balance chaining through the month
- Pressure point identification (high expense days)
- Year forecast with month-to-month chaining
- Handles missing paycheck/recurring data gracefully

## Recent Fixes (Session Ending)

1. **Module Loading** - Fixed JavaScript module loading to use single entry point
2. **Calendar Data Format** - Aligned backend response with frontend expectations
3. **Auto User Data** - Automatic creation of default settings on signup
4. **Error Handling** - Enhanced error logging and display throughout
5. **Unified Architecture** - Single Express server serving frontend + API

## Known Limitations
- No transaction history feature (future enhancement)
- No budget goals/alerts (future enhancement)
- No multi-currency support (future enhancement)

## Testing Checklist
- ✅ Signup creates user account
- ✅ Login authenticates user
- ✅ Dashboard loads monthly projection
- ✅ Calendar displays month grid
- ✅ Recurring items can be added/edited/deleted
- ✅ Settings save paycheck configuration
- ✅ Frontend properly displays all views
- ✅ API endpoints respond correctly
- ✅ Database stores/retrieves data
- ✅ JWT authentication protects endpoints

## Next Steps (Future)
1. Add transaction history tracking
2. Implement budget goal alerts
3. Add bill/paycheck reminders
4. Multi-user household support
5. Mobile app version
6. Dark mode theme
7. Export reports (PDF/CSV)
