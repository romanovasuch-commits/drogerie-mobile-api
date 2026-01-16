# Drogerie Mobile API — DevOps Test Project
![CI](https://github.com/romanovasuch-commits/drogerie-mobile-api/actions/workflows/ci.yml/badge.svg)
## Overview
This project demonstrates deployment and orchestration of a microservices-based backend using **Docker Compose**.  
The main focus is **infrastructure reliability, service dependencies, healthchecks, and troubleshooting**, rather than application business logic.

The project was created as a **hands-on DevOps practice** and reflects real-world scenarios encountered during local and production environment setup.

---

## Architecture

**Microservices:**
- API Gateway
- Users Service
- Orders Service
- Notifications Service

**Infrastructure services:**
- PostgreSQL (database)
- Redis (cache)
- RabbitMQ (message broker with Management UI)

All services are connected via an isolated Docker bridge network.

---

## Tech Stack
- Docker
- Docker Compose
- PostgreSQL 16
- Redis 7
- RabbitMQ (management enabled)
- Node.js microservices

---

## How to Run

```bash
docker compose up -d --build
```md
Stop services:
```bash
docker compose down