# Carpool Application

The Carpool application helps users share rides within campuses or across cities by matching routes and schedules. Drivers can offer rides and passengers can find rides that fit their pickup/dropoff and time window. The app reduces cost, congestion, and carbon footprint while providing a simple, secure experience.

## Core Features

* **Authentication**

  * Sign up, log in, log out (JWT-based)
  * Profile view/update (name, email, university, address)

* **Rides (Driver)**

  * Offer a ride (pickup/dropoff with coordinates, seats, time, price, notes)
  * View “My Rides”
  * Update or delete your rides

* **Find a Ride (Passenger)**

  * Geo + time-window search (lng/lat with 2dsphere index)
  * Filter by radius, departure time window, and minimum seats
  * Real-time updates when new rides are posted (Socket.IO)

* **Bookings**

  * Request a booking (passenger → driver)
  * Driver accepts/rejects booking; seats adjust automatically
  * Live notifications for ride/booking updates (Socket.IO)

## Tech Stack

* **MongoDB** with 2dsphere indexes for geospatial queries
* **Express** REST API with JWT auth
* **React** (CRA) frontend with Tailwind CSS
* **Node.js** backend
* **Socket.IO** for real-time ride/booking updates

## Project Structure

```
Carpool/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

### Backend (Node.js/Express)

* `server.js`: Entry point for the Express server.
* `config/db.js`: Database connection setup.
* `controllers/`: Logic for authentication, booking, and rides.
* `middleware/authMiddleware.js`: Handles authentication checks.
* `models/`: Mongoose models for User, Ride, Booking.
* `routes/`: API endpoints for auth, booking, and rides.

### Frontend (React/Tailwind CSS)

* `src/components/`: Reusable UI components (Navbar, RideForm, RideList, etc.)
* `src/pages/`: Main pages (Login, Register, Profile, Rides, Search)
* `src/context/AuthContext.js`: Authentication context provider
* `src/axiosConfig.jsx`: Axios setup for API requests
* `public/`: Static assets and HTML template

## Setup Instructions

1. **Install dependencies**

   ```bash
   npm run install-all
   ```

   (Installs dependencies for both backend and frontend)

2. **Configure environment variables**
   Add your database URI and other secrets in `backend/config/db.js` or a `.env` file.

3. **Run the backend**

   ```bash
   cd backend
   npm start
   ```

4. **Run the frontend**

   ```bash
   cd frontend
   npm start
   ```

## Usage

* Access the frontend at [http://localhost:3000](http://localhost:3000)
* Backend API runs at [http://localhost:5001](http://localhost:5001) (default)

