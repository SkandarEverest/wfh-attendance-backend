# WFH Attendance Backend

Backend API for a WFH attendance system, built with NestJS, TypeORM, MySQL, and Redis.

## Features

- Cookie-based JWT authentication (`access_token`, HttpOnly)
- Role-based authorization using CASL policies
- User management with soft delete
- Timesheet check-in with photo upload
- Duplicate check-in prevention per user + `workDate`
- Redis-backed active session validation and logout revocation
- Swagger docs in non-production environments

## Tech Stack

- NestJS 10
- TypeORM 0.3
- MySQL 8+
- Redis
- JWT + `cookie-parser`
- class-validator / class-transformer
- Swagger (OpenAPI)

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- npm
- MySQL 8+
- Redis 6+

## Quick Start

```bash
npm install
cp .env.example .env
```

Create database:

```sql
CREATE DATABASE wfh_attendance;
```

Run migrations and seeders:

```bash
npm run migration:run
npm run seed:run:all
```

Run app:

```bash
npm run start:dev
```

Default API base URL:

- `http://localhost:7777/api`
- Versioned routes: `http://localhost:7777/api/v1/...`

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | App port | `7777` |
| `API_PREFIX` | Global API prefix | `api` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `root` |
| `DB_NAME` | MySQL database name | `wfh_attendance` |
| `JWT_SECRET` | JWT signing secret | `super-secret-jwt-key` |
| `JWT_EXPIRES_IN` | JWT lifetime (also session TTL) | `8h` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | `` |
| `REDIS_CACHE_TTL` | Redis TTL in seconds | `28800` |
| `UPLOAD_DIR` | Uploaded files directory | `uploads` |
| `MAX_FILE_SIZE_MB` | Max upload file size | `5` |
| `REQUEST_TIMEOUT` | Request timeout in ms | `30000` |

Optional variables used by admin seeder:

- `DEFAULT_ADMIN_EMAIL` (default: `admin@wfh.local`)
- `DEFAULT_ADMIN_NAME` (default: `Administrator`)
- `DEFAULT_ADMIN_PASSWORD` (default: `password`)
- `REDIS_TLS=true` to enable Redis TLS mode

## Available Scripts

- `npm run start` - start application
- `npm run start:dev` - start in watch mode
- `npm run start:prod` - run built app from `dist`
- `npm run build` - compile project
- `npm run test` - run unit tests
- `npm run migration:create --name=<MigrationName>` - generate migration file
- `npm run migration:run` - apply migrations
- `npm run migration:revert` - revert latest migration
- `npm run seed:create --name=<SeederName>` - generate seeder file
- `npm run seed:run --name=<SeederFilePrefix>` - run one seeder by file prefix
- `npm run seed:run:all` - run all seeders

## Authentication Notes

- Default seeded admin login: `admin@wfh.local` / `password`.
- Login endpoint sets JWT in cookie: `access_token`.
- Protected routes read token from cookie, not `Authorization` header.
- Configure your client to send credentials (`withCredentials: true` for browser clients).
- In local development, `secure: true` cookies require HTTPS; if you test over plain HTTP, cookie delivery may be blocked by the browser.

## API Endpoints

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api` | Warm greeting |
| `GET` | `/api/health-check` | Health check |
| `POST` | `/api/v1/auth` | Login |
| `POST` | `/api/v1/auth/logout` | Logout |

### Authenticated

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/auth/profile` | Current user profile |
| `GET` | `/api/v1/users/roles` | Role list |
| `GET` | `/api/v1/users` | List users (paginated) |
| `GET` | `/api/v1/users/:id` | User detail |
| `POST` | `/api/v1/users` | Create user |
| `PUT` | `/api/v1/users/:id` | Update user |
| `PATCH` | `/api/v1/users/delete/:id` | Soft delete user |
| `GET` | `/api/v1/timesheets` | List all timesheets (paginated, filter `name`) |
| `GET` | `/api/v1/timesheets/my` | Current user timesheets |
| `GET` | `/api/v1/timesheets/photo?path=<photoPath>` | Fetch uploaded photo |
| `POST` | `/api/v1/timesheets/check-in` | Check-in with photo |

Timesheet check-in request uses `multipart/form-data`:

- `workDate` (`YYYY-MM-DD`)
- `notes` (string)
- `photo` (image file, required)

Pagination query:

- `page` (default `1`)
- `size` (default `10`, max `100`)

## Swagger

Swagger is enabled only when `NODE_ENV` is not `production`:

- `http://localhost:7777/api/documentation`

## Project Structure

```text
src/
  api.ts
  app.controller.ts
  app.module.ts
  app.service.ts
  swagger.ts
  auth/
  modules/v1/
    users/
    timesheets/
  common/
    decorators/
    guards/
    filters/
    interceptors/
  config/
    env/
    database/
    cache/
    casl/
  database/
    migrations/
    seeders/
  models/
bin/
  typeorm.ts
  generate-migration.ts
  generate-seeder.ts
types/response/
```
