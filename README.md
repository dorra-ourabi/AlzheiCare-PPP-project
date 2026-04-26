# AlzheivCare

A platform designed to help Alzheimer's patients and their families track the illness, stay connected with their doctor, and manage daily care — all in one place.

---

## What is AlzheivCare?

AlzheivCare is a full-stack web and mobile platform built around the patient. A caregiver creates an account on behalf of their loved one, and from there they can monitor the patient's location in real time, chat with the assigned doctor, log daily observations, and track medications — while an AI assistant is always available to answer questions about Alzheimer's.

The platform is designed with one goal in mind: make caregiving less overwhelming.

---

## Features

- **GPS tracking** — Real-time patient location via an ESP32 device. Automatic alert if the patient leaves a 300m safe zone. Escalation to emergency services if no caregiver responds within 1 hour.
- **Real-time chat** — Direct messaging between caregivers and the assigned doctor. Urgent message flagging with push notifications.
- **Stage classifier** — Caregivers log daily observations via a structured checklist. The platform classifies the Alzheimer stage and tracks progression over time.
- **AI assistant** — Answers questions about Alzheimer's, checks information, and fetches the latest research. Available to both caregivers and doctors.
- **Medication & calendar** — Medication schedules, appointment tracking, and automated reminders.
- **Cognitive games** — Memory and puzzle games to stimulate patients in early stages.

---

## Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Mobile    | React Native                    |
| Web       | React                           |
| Backend   | NestJS (Node.js + TypeScript)   |
| Database  | PostgreSQL via Prisma           |
| Cache     | Redis                           |
| ML & AI   | FastAPI (Python) + scikit-learn |
| Real-time | Socket.io                       |
| Maps      | Leaflet.js + OpenStreetMap      |
| Hardware  | ESP32 + GPS NEO-6M              |

---

## Project Structure

```
alzheicare/
├── application/          # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication — Google OAuth + Local
│   │   ├── users/        # Caregiver, Doctor, Admin
│   │   ├── patient/      # Patient accounts
│   │   ├── chat/         # Real-time messaging
│   │   ├── gps/          # GPS tracking & geofencing
│   │   ├── calendar/     # Medications & appointments
│   │   ├── stage/        # Stage classifier
│   │   ├── games/        # Cognitive games
│   │   ├── ai/           # AI assistant
│   │   └── notifications/# Push notifications
│   ├── prisma/
│   │   └── schema.prisma # Full database schema
│   └── .env.example
├── ml-service/           # FastAPI Python service
├── mobile/               # React Native app
├── web/                  # React web dashboard
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) v18 or higher
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) and Docker Compose
- [Python](https://python.org) 3.10+ (for the ML service)

### 1. Clone the repository

```bash
git clone https://github.com/your-team/alzheicare.git
cd alzheicare
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp application/.env.example application/.env
```

Your `.env` should contain at minimum:

```
DATABASE_URL="postgresql://postgres:pass123@localhost:5432/alzheicare_db"
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL in the background. You only need to run this once.

### 4. Install dependencies and run the backend

```bash
cd application
pnpm install
pnpm prisma db push
pnpm start:dev
```

The API will be available at `http://localhost:3000`.

### 5. Open Prisma Studio (optional)

To visualize and inspect your database in the browser:

```bash
pnpm prisma studio
```

---

## Environment Variables

| Variable               | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                      |
| `JWT_SECRET`           | Secret key for signing JWT tokens                 |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                        |
| `REDIS_URL`            | Redis connection string (added later)             |
| `OPENAI_API_KEY`       | OpenAI API key for the AI assistant (added later) |

---

## Docker

The `docker-compose.yml` runs infrastructure services only. The application itself runs locally with `pnpm start:dev`.

```yaml
# Start all services in background
docker compose up -d

# Stop all services
docker compose down

# Stop and remove all data (careful — this wipes the database)
docker compose down -v
```

---

## Team

| Name | Role                                          |
| ---- | --------------------------------------------- |
|      | Backend — NestJS, API, Auth                   |
|      | Real-time & GPS — Socket.io, MQTT, ESP32      |
|      | Frontend — React, React Native, Maps          |
|      | ML & AI — FastAPI, scikit-learn, AI assistant |

---

## Status

🚧 **Early development** — Auth and database setup in progress.

---

## Notes

- This project is built for academic purposes as part of a university program.
- The stage classification feature is not a medical diagnosis tool. It is always accompanied by a recommendation to consult a licensed physician.
- GPS and emergency escalation features are designed for the Tunisian context (emergency number: 197 SAMU).
