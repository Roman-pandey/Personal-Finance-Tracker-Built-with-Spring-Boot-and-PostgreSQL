# Personal Finance & Expense Tracker

A full-stack Personal Finance and Expense Management web application built with **Spring Boot 3**, **MySQL**, **React 19 (Vite)**, and **Tailwind CSS**.

---

## 🔑 Demo Account Credentials

You can log in to the application using the default demo account created on application startup:

* **Email:** `demo@example.com`
* **Password:** `password123`

---

## 📊 Dummy Seed Data (On-Demand)

> **Note:** Dummy data is **NOT** automatically inserted into the database on startup. New accounts and the demo user start clean. You can insert or clear comprehensive realistic test data anytime using the Seed REST API on demand.

### 1. Insert Dummy Seed Data
To populate **400+ realistic expense records** and **40+ income records** distributed across the last 12 months for testing analytics, filters, and pagination:

```bash
# Insert seed data for demo account
curl -X POST "http://localhost:8080/api/seed?email=demo@example.com"

# Force reset and re-populate fresh seed data
curl -X POST "http://localhost:8080/api/seed?email=demo@example.com&forceReset=true"
```

### 2. Clear Dummy Data
To clear all generated test data for an account:

```bash
curl -X DELETE "http://localhost:8080/api/seed?email=demo@example.com"
```

---

## 🚀 How to Run the Application

### 1. Database
Ensure **MySQL** server is running on `localhost:3306` with database `expense_tracker`.

### 2. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
* **Backend API URL:** `http://localhost:8080/`

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Web App URL:** `http://localhost:5173/`

---

## ✨ Key Features

* **Expense & Income Management**: Full CRUD capabilities for tracking expenses and incomes.
* **Newest First Ordering**: Latest entries always appear at the top.
* **Interactive Filters**: Search by title/notes, Category, Timeframe (*Today*, *This Week*, *This Month*, *This Year*), and Payment Method (*Cash*, *Card*, *UPI*, *Bank Transfer*).
* **Spending Analytics Charts**: Interactive bar charts with **Daily, Weekly, Monthly, and Yearly** aggregation.
* **Pagination**: 10 records per page with Previous/Next controls and page numbers.
