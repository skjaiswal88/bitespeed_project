# Bitespeed Backend Task: Identity Reconciliation

[![Live Deployment Status](https://img.shields.io/badge/Live_Deployment-Render-success?style=flat-square&logo=render)](https://bitespeed-identity-api-w3wl.onrender.com)
**Live API Endpoint:** `https://bitespeed-identity-api-w3wl.onrender.com/identify`

A Node.js web service that identifies and keeps track of a customer's identity across multiple purchases by linking their email and phone numbers.

## Features
- **Reconciliation Engine:** Links customers who share an email or phone number.
- **Cluster Merging:** Capable of merging two formerly distinct primary customers if a new purchase links them together.
- **Primary/Secondary Logic:** Retains the oldest contact as the `primary` and treats all other linked contacts as `secondary`.

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Production) / SQLite (Local)
- **ORM:** Prisma

---

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup the Database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The service will start on `http://localhost:3000`.

---

## API Endpoint

### `POST /identify`

**Request Body:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
*(At least one of `email` or `phoneNumber` must be provided).*

**Test the Live API via cURL:**
```bash
curl -X POST https://bitespeed-identity-api-w3wl.onrender.com/identify \
-H "Content-Type: application/json" \
-d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

---

## Deployment (Render.com)

The project includes a `render.yaml` configuration and a custom `start.sh` script for easy, robust deployment on [Render](https://render.com).

1. Connect your GitHub repository to Render as a **Web Service**.
2. Create a Free **PostgreSQL** database on Render.
3. Add the `DATABASE_URL` environment variable to your Web Service using the Internal Database URL from your new Postgres instance.
4. Render will automatically detect the settings from `render.yaml` and the `start.sh` will handle Prisma schema synchronization and boot the application.

**Live Hosted Endpoint:**
`https://bitespeed-identity-api-w3wl.onrender.com`
