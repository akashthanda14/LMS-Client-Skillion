# 🚀 LMS Authentication Server - Setup Guide

## Quick Start

Follow these steps to get the server up and running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

**Important configurations to update:**

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Admin credentials
- Email settings (if using email verification)
- Twilio settings (if using SMS verification)

### 3. Set Up Database

Make sure PostgreSQL is installed and running, then:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in .env)

### 5. Test the Server

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api
```

---

## 📋 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

---

## 🔗 API Endpoints

### User Authentication (`/api/user-auth`)

- `POST /register` - Register new user
- `POST /verify-email-otp` - Verify email OTP
- `POST /verify-phone-otp` - Verify phone OTP
- `POST /complete-profile` - Complete user profile
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP

### Protected Routes (require JWT token)

- `POST /request-email-change` - Request email change
- `POST /verify-email-change` - Verify email change
- `POST /request-phone-change` - Request phone change
- `POST /verify-phone-change` - Verify phone change
- `GET /auth/status` - Get authentication status

### Admin (`/api/admin-auth`)

- `POST /login` - Admin login

---

## 🗄️ Database Setup

### PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Access PostgreSQL
psql postgres

# Create database
CREATE DATABASE lms_db;

# Create user (optional)
CREATE USER lms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;

# Exit
\q
```

---

## 🔐 Security Notes

1. **Change JWT_SECRET** in production to a secure random string
2. **Update admin credentials** immediately
3. **Use HTTPS** in production
4. **Enable rate limiting** for API endpoints
5. **Never commit .env file** to version control

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials
- Check if database exists

### Prisma Issues
```bash
# Reset Prisma Client
rm -rf node_modules/.prisma
npm run prisma:generate
```

---

## 📚 Documentation

For detailed API documentation and examples, see:
- `README.md` - Full documentation
- `INTEGRATION_EXAMPLE.js` - Integration examples
- `QUICK_REFERENCE.md` - Quick reference guide

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check that all dependencies are installed

---

Made with ❤️ for LMS Project
