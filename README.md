# Kharcha - Expense Tracker

A full-stack expense tracker where you can log your spending, sort it by category and see where your money goes. Built with React, Spring Boot and MySQL.

## Screenshots

![Home page](docs/screenshots/home.png)

![Expenses page](docs/screenshots/expenses.png)

## Features

- Add, edit and delete expenses
- Filter expenses by category (Food, Rent, Travel, Bills, Fun)
- Live totals, a category breakdown bar, and summary tiles for the highest expense, the average expense and the top category
- Animated home page
- Data stored in MySQL through a REST API

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Bootstrap, React Router, Axios |
| Backend | Java 17, Spring Boot, Spring Data JPA, REST APIs |
| Database | MySQL |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Add an expense |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js (LTS)
- MySQL 8

### 1. Create the database

```sql
CREATE DATABASE expense_tracker;
```

### 2. Run the backend

Create the file `backend/src/main/resources/application-local.properties` with your MySQL password. This file is ignored by Git:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Then start the server:

```bash
cd backend
./mvnw spring-boot:run
```

The API runs on `http://localhost:8081`. On Windows PowerShell, use `.\mvnw spring-boot:run`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Roadmap

- Dashboard page with monthly charts
- User registration and login with JWT
- Monthly budget with warnings
- Deployment

## Author

Prajakta Kar - [GitHub](https://github.com/Prajakta-kar)