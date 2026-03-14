# WFH Attendance Backend

Backend API for the WFH Attendance Web Application built with NestJS + TypeORM + MySQL.

## Features

- **Cookie-based JWT Authentication** — Login with HttpOnly cookie, profile, role-based access
- **User Management** — CRUD operations (admin only)
- **Timesheet / Attendance** — Submit attendance with photo proof, view history
- **File Upload** — Photo proof stored locally via multer
- **Swagger Documentation** — Auto-generated API docs (non-production)
- **Duplicate Prevention** — One attendance per user per day

## Tech Stack

- NestJS 10
- TypeORM (manual DataSource + FactoryProvider pattern)
- MySQL
- JWT (cookie-based, HttpOnly)
- class-validator / class-transformer
- Swagger (OpenAPI)

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- npm or yarn

### Installation

```bash
cd wfh-attendance-backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

| Variable                 | Description                 | Default            |
| ------------------------ | --------------------------- | ------------------ |
| `NODE_ENV`               | Environment                 | `development`      |
| `PORT`                   | Server port                 | `3000`             |
| `API_PREFIX`             | API route prefix            | `api`              |
| `DB_HOST`                | Database host               | `localhost`        |
| `DB_PORT`                | Database port               | `3306`             |
| `DB_USER`                | Database username           | `root`             |
| `DB_PASSWORD`            | Database password           | `root`             |
| `DB_NAME`                | Database name               | `wfh_attendance`   |
| `JWT_SECRET`             | JWT signing secret          | `super-secret-...` |
| `JWT_EXPIRES_IN`         | Token expiration            | `8h`               |
| `UPLOAD_DIR`             | Photo upload directory      | `uploads`          |
| `MAX_FILE_SIZE_MB`       | Max upload size (MB)        | `5`                |
| `DEFAULT_ADMIN_NAME`     | Seed admin name             | `System Admin`     |
| `DEFAULT_ADMIN_EMAIL`    | Seed admin email            | `admin@wfh.local`  |
| `DEFAULT_ADMIN_PASSWORD` | Seed admin password         | `Admin12345!`      |

### Database Setup

Create the MySQL database:

```sql
CREATE DATABASE wfh_attendance;
```

### Seed Default Admin

```bash
npm run seed
```

### Running

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

### Swagger Docs

Available at: `http://localhost:3000/api/documentation` (non-production only)

## API Endpoints

### Auth

| Method | Endpoint             | Auth     | Description         |
| ------ | -------------------- | -------- | ------------------- |
| POST   | `/api/v1/auth`       | Public   | Login               |
| POST   | `/api/v1/auth/logout`| Public   | Logout (clear cookie)|
| GET    | `/api/v1/auth/profile`| Bearer  | Get current profile |

### Users (Admin Only)

| Method | Endpoint              | Auth   | Description       |
| ------ | --------------------- | ------ | ----------------- |
| GET    | `/api/v1/users`       | Admin  | List all users    |
| GET    | `/api/v1/users/:id`   | Admin  | Get user by ID    |
| POST   | `/api/v1/users`       | Admin  | Create user       |
| PUT    | `/api/v1/users/:id`   | Admin  | Update user       |
| PATCH  | `/api/v1/users/delete/:id` | Admin  | Soft delete user  |

### Timesheets

| Method | Endpoint                    | Auth       | Description                |
| ------ | --------------------------- | ---------- | -------------------------- |
| POST   | `/api/v1/timesheets/check-in` | Bearer   | Check-in attendance + photo|
| GET    | `/api/v1/timesheets/my`     | Bearer     | My timesheets (paginated)  |
| GET    | `/api/v1/timesheets`        | Admin      | All timesheets (paginated) |
| GET    | `/api/v1/timesheets/:id`    | Bearer     | Get timesheet by ID        |
| GET    | `/api/v1/timesheets/:id/photo`| Bearer   | Get timesheet photo file   |

### Login Request

```json
{
  "email": "admin@wfh.local",
  "password": "Admin12345!"
}
```

### Login Response

```json
{
  "success": true,
  "status": 200,
  "message": "Login successful.",
  "data": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@wfh.local",
    "role": "admin"
  }
}
```

> Note: The JWT token is set as an HttpOnly cookie (`access_token`), not returned in the response body.

### Submit Attendance

Send as `multipart/form-data`:

- `photo` — image file (jpg, jpeg, png, webp), max 5MB
- `notes` — optional text

### Pagination

Use query params on list endpoints:

- `page` — page number (default: `1`)
- `size` — items per page (default: `10`, max: `100`)

## Project Structure

```
src/
├── api.ts                              # Bootstrap entry point
├── app.module.ts                       # Root module
├── app.controller.ts                   # Health check controller
├── app.service.ts                      # App service
├── swagger.ts                          # Swagger setup
├── config/
│   ├── env/
│   │   └── main.config.ts             # Exported config constants
│   └── database/
│       ├── providers.module.ts         # DatabaseModule
│       └── mysql/
│           ├── mysql.config.ts         # DataSource factory provider
│           └── mysql.repository.ts     # Repository factory providers
├── common/
│   ├── decorators/                     # @Public, @Roles, @User
│   ├── filters/                        # HttpExceptionFilter
│   ├── guards/                         # TokenGuard, RolesGuard
│   └── helpers/                        # parser.ts, helper.ts
├── models/                             # Entities (centralized)
│   ├── base.entity.ts
│   ├── user.entity.ts
│   └── timesheet.entity.ts
├── auth/                               # Auth module (root level)
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.dto.ts
├── modules/
│   └── v1/
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── users.dto.ts
│       └── timesheets/
│           ├── timesheets.module.ts
│           ├── timesheets.controller.ts
│           ├── timesheets.service.ts
│           └── timesheets.dto.ts
└── database/
    └── seeds/
        └── seed.ts                     # Admin seeder
types/
└── response/
    ├── GenericResponse.d.ts
    ├── ServiceResponse.d.ts
    └── UserInfo.d.ts
```
