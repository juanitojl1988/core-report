# Core Report

Core Report is a robust backend service built with [NestJS](https://nestjs.com/), designed to handle report generation, scheduling, and management. It utilizes **jsreport** for rendering reports (PDF/Excel) and **Prisma** for database interactions with PostgreSQL.

## 🚀 Features

- **Report Generation**: Integration with `jsreport` to generate dynamic reports.
- **Scheduled Tasks**: Automated report cleanup tasks using CRON jobs.
- **Authentication**: Secure API key authentication using the `X-API-KEY` header.
- **Database**: PostgreSQL integration via Prisma ORM.
- **Dockerized**: Ready-to-deploy Docker setup.

## 📂 Project Structure

- `code/`: Application source code (NestJS).
- `infra/`: Infrastructure configuration (Docker).

## 🛠 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v22 or later recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [PostgreSQL](https://www.postgresql.org/)

## ⚙️ Environment Variables

Copy the `.env.templete` file to `.env` in the `code` directory and configure the environment variables:

```bash
cp code/.env.templete code/.env
```

| Variable                          | Description                                 | Default / Example                                   |
| --------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `PORT_CORE`                       | Port where the service runs                 | `3000`                                              |
| `API_KEY`                         | Secret key for authentication               | `1ab2c3d4e5f6...`                                   |
| `DATABASE_URL`                    | PostgreSQL connection string                | `postgresql://user:pass@host:5432/db?schema=public` |
| `CRON_EXPRESSION_DELETE_REPORTES` | CRON expression for cleaning reports        | `0 0 */10 * *`                                      |
| `PATH_REPO_REPORTES`              | File system path to store generated reports | `///` or `/app/data`                                |

## 💻 Installation (Local)

1.  **Navigate to the code directory**:

    ```bash
    cd code
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Generate Prisma Client**:

    ```bash
    npx prisma generate
    ```

4.  **Run the application**:

    ```bash
    # Development mode
    npm run start:dev

    # Production mode
    npm run start:prod
    ```

## 🐳 Running with Docker

The project includes Docker configuration in the `infra` directory.

To run the application using Docker:

1.  Navigate to the `infra` directory:

    ```bash
    cd infra
    ```

2.  Build and start the container (ensure your build context is set correctly if modifying `docker-compose.yml`, or run from root pointing to the file):

    _Recommended method from project root:_

    ```bash
    docker-compose -f infra/docker-compose.yml up --build
    ```

    The service will be available at `http://localhost:3010`.

## 🔐 Authentication

All API endpoints are protected. You must include the `X-API-KEY` header in your requests.

```http
GET /some/endpoint
X-API-KEY: your_configured_api_key
```

## 🧪 Testing

Run the test suite to ensure everything is working correctly:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
