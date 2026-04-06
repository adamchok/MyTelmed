# MyTelmed

**MyTelmed** is a full-stack telemedicine platform designed for the Malaysian healthcare ecosystem.  
It combines patient care workflows (booking, consultation, prescription, delivery, records) with multi-role operational portals for doctors, pharmacists, and administrators.

Built as a production-style system with real-world integrations, MyTelmed demonstrates end-to-end product engineering across:
- secure authentication and account management
- video consultation and chat
- e-prescriptions and medication delivery
- document and family-care workflows
- payment processing and operational notifications

---

## Why This Project Stands Out

- **End-to-end domain complexity**: covers patient journey from onboarding to follow-up care.
- **Multi-role system design**: separate experiences for `patient`, `doctor`, `pharmacist`, and `admin`.
- **Real service integrations**: Stripe, Stream (video/chat), AWS (S3 + DynamoDB + Bedrock), Mailgun, Web Push.
- **Scalable backend foundation**: Spring Boot with async processing, scheduling, retry, and actuator health checks.
- **Modern frontend architecture**: Next.js App Router with TypeScript, reusable UI modules, and PWA support.

---

## Product Capabilities

### Patient Experience
- account registration, verification, and authentication
- appointment booking and management
- video consultations with providers
- digital prescriptions and delivery flow
- medical document upload and access control
- family member management and permissions
- billing and payment interactions

### Clinical & Operations Portals
- **Doctor portal**: appointments, patient context, prescriptions, referrals, consultation workflows
- **Pharmacist portal**: prescription fulfillment and medication delivery lifecycle
- **Admin portal**: system oversight and operational management

### Platform Services
- push notifications and email notifications
- scheduled reminders and workflow automations
- secure token-based authentication
- cloud storage and media/document handling
- AI transcription-related backend components (AWS Bedrock + transcription modules)

---

## Architecture Overview

MyTelmed is organized as a two-application monorepo:

- `mytelmed-frontend`: Next.js 14 (TypeScript) web client with PWA capabilities
- `mytelmed-backend`: Spring Boot 3.5 API and business logic service

The frontend communicates with backend REST APIs and external services through secure, role-aware flows.  
Backend modules are domain-driven by feature areas (`appointment`, `auth`, `delivery`, `document`, `family`, `payment`, `videocall`, etc.).

---

## Tech Stack

### Frontend (`mytelmed-frontend`)
- Next.js 14 (App Router), React 18, TypeScript
- Ant Design + TailwindCSS
- Redux Toolkit
- Stream Video + Stream Chat SDKs
- Stripe.js
- PWA configuration (`@ducanh2912/next-pwa`)

### Backend (`mytelmed-backend`)
- Java 21, Spring Boot 3.5
- Spring Security, Spring Data JPA, Validation, Actuator
- PostgreSQL
- JWT authentication (`jjwt`)
- MapStruct + Lombok
- AWS SDK v2 (S3, DynamoDB, Bedrock Runtime)
- Stripe Java SDK
- Mailgun Java SDK
- Web Push notifications

### DevOps & Runtime
- Gradle build pipeline
- Docker multi-stage backend image
- Docker Compose backend service orchestration
- Health checks via Spring Actuator

---

## Repository Structure

```text
MyTelmed/
├─ mytelmed-frontend/   # Next.js client app (patient/doctor/pharmacist/admin interfaces)
└─ mytelmed-backend/    # Spring Boot API, domain services, integrations, schedulers
```

---

## Local Development Setup

## Prerequisites
- Node.js 20+
- npm 10+
- Java 21
- PostgreSQL
- Docker Desktop (optional, for containerized backend)

## 1) Clone and enter the project

```bash
git clone <your-repo-url>
cd MyTelmed
```

## 2) Backend setup (`mytelmed-backend`)

Create `mytelmed-backend/.env` (used by Docker Compose and backend config):

```env
DB_URL=jdbc:postgresql://localhost:5432/mytelmed
DB_USERNAME=postgres
DB_PASSWORD=postgres

JWT_SECRET_KEY=replace_me
ENCRYPTION_SECRET_KEY=replace_me
HASHING_SECRET_KEY=replace_me
FRONTEND_URL=http://localhost:3000

AWS_ACCESS_KEY=replace_me
AWS_SECRET_KEY=replace_me
AWS_REGION=ap-southeast-1
AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME=replace_me
AWS_S3_BUCKET_NAME=replace_me
AWS_DYNAMODB_ARTICLES_TABLE_NAME=replace_me
AWS_DYNAMODB_TRANSCRIPTION_TABLE_NAME=replace_me
AI_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0

MAILGUN_API_KEY=replace_me
MAILGUN_DOMAIN=replace_me

VAPID_PUBLIC_KEY=replace_me
VAPID_PRIVATE_KEY=replace_me
VAPID_SUBJECT=mailto:you@example.com

STREAM_API_KEY=replace_me
STREAM_API_SECRET=replace_me

STRIPE_SECRET_KEY=replace_me
STRIPE_WEBHOOK_ENDPOINT_SECRET=replace_me
```

Run backend locally:

```bash
cd mytelmed-backend
./gradlew bootRun
```

Backend default URL: `http://localhost:8080`

### Optional: run backend with Docker

```bash
cd mytelmed-backend
docker compose up --build
```

---

## 3) Frontend setup (`mytelmed-frontend`)

Create `mytelmed-frontend/.env.local`:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_STREAM_API_KEY=replace_me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=replace_me
NEXT_PUBLIC_VAPID_PUBLIC_KEY=replace_me
NEXT_PUBLIC_S3_HOSTNAME=replace_me

# optional for local service worker behavior
NEXT_PUBLIC_SW_DISABLED=false
```

Install and run:

```bash
cd mytelmed-frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

---

## Build and Test Commands

### Frontend
```bash
cd mytelmed-frontend
npm run lint
npm run build
```

### Backend
```bash
cd mytelmed-backend
./gradlew test
./gradlew build
```

---

## Security and Reliability Notes

- Spring Security + JWT-based authentication and role-aware authorization
- Centralized secret-based configuration via environment variables
- Containerized backend with non-root runtime user
- Actuator health endpoint for observability (`/actuator/health`)
- Async + scheduled + retry-enabled backend processes for operational resilience
