# Hair-Studio

A luxury hair studio and barber salon web application with online appointment booking, live slot management, customer notifications, and an admin dashboard.

## Features

- **Direct Online Appointment Booking:** Fast, streamlined booking without requiring customer pre-registration.
- **Admin Dashboard:** Secure portal to manage appointments, confirm bookings, update time slots, and view client history.
- **Real-Time Client Notifications:** Automated client notification updates for confirmed appointments and slot changes.
- **Printable Appointment Slips:** One-click booking slip generation for clients.
- **Interactive Cyberpunk / Luxury UI:** Rich visual design featuring neon glow animations, service showcase, and customer reviews.
- **MongoDB Atlas Integration:** Cloud-hosted database storage for appointments, slots, and services.

## Tech Stack

- **Frontend:** HTML5, CSS3 (Custom animations & styling), JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```

4. Open `http://localhost:5000` (or `DTI.html`) in your browser.

## Deploying to Vercel

1. Import the repository in [Vercel](https://vercel.com): `ajaykumarravulapalli/Hair-Studio`.
2. Keep the default build and output settings (handled automatically via `vercel.json` and `api/index.js`).
3. Add the following **Environment Variables** in Vercel Project Settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `DB_NAME`: Database name (e.g. `hairstudio`).
   - `ADMIN_EMAIL`: `ajayravulapalli.555@gmail.com`
   - `ADMIN_PASSWORD`: Your admin password.
   - `JWT_SECRET`: A secure random secret string for JWT authentication.
4. Click **Deploy**. Vercel will host the frontend on its global Edge CDN and run the backend API as serverless functions.
