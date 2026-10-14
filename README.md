# PlacementHub — University Placement & Career Automation Portal

A full-stack, enterprise-grade placement management platform engineered for **MLRIT** (Marri Laxman Reddy Institute of Technology), connecting students and placement officers with corporate opportunities.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS, Lucide React icons, Axios
- **Backend**: Python 3.11+, Flask, Flask-CORS, PyJWT, bcrypt
- **Database**: MySQL 8.0+ / MariaDB 10.5+ via SQLAlchemy ORM and PyMySQL (with automatic SQLite fallback for offline development)
- **Authentication**: Stateless JWT token authentication with server-side role-based authorization

---

## 📁 Project Architecture

```
placementhub/
├── backend/
│   ├── routes/
│   │   ├── admin_routes.py         # Student records, security status, invitations
│   │   ├── announcements_routes.py # Placement announcements CRUD
│   │   ├── attendance_routes.py    # Training attendance tracking & scores
│   │   ├── auth_routes.py          # Student & Admin signup/login/verification
│   │   ├── certifications_routes.py# Certifications & voucher enrollment
│   │   ├── drives_routes.py        # Placement drives CRUD & registration
│   │   ├── exams_routes.py         # Diagnostic & benchmark exams
│   │   ├── internships_routes.py   # Internship opportunities & applications
│   │   ├── jobs_routes.py          # Full-time job postings & applications
│   │   ├── notifications_routes.py # User notifications
│   │   ├── profile_routes.py       # Student profile & avatar updates
│   │   ├── queries_routes.py       # Student queries & TPO resolutions
│   │   ├── reviews_routes.py       # Interview reviews & company ratings
│   │   └── training_routes.py      # Technical & soft skills training
│   ├── app.py                      # Flask application factory & blueprints
│   ├── auth_middleware.py          # JWT, bcrypt & RBAC decorators
│   ├── config.py                   # App configuration & validation rules
│   ├── database.py                 # SQLAlchemy connection & DB auto-creation
│   ├── models.py                   # SQLAlchemy ORM models for all tables
│   ├── schema.sql                  # Complete standalone MySQL schema SQL
│   ├── seed.py                     # Initial seed data for fresh database
│   └── test_backend.py             # 23-test automated integration suite
├── src/
│   ├── components/                 # Reusable UI components & layouts
│   ├── context/                    # Central PlacementContext with live API sync
│   ├── pages/
│   │   ├── admin/                  # Admin console pages
│   │   ├── auth/                   # Login, Signup, Access Denied pages
│   │   └── student/                # Student dashboard, drives, profile, etc.
│   └── services/
│       └── api.js                  # Axios API client with JWT interceptors
├── .env.example                    # Template environment variables
├── init_mysql.py                   # One-click MySQL database setup script
├── requirements.txt                # Python backend dependencies
├── run.py                          # Flask backend entrypoint (port 5000)
├── package.json                    # Node dependencies & npm scripts
└── vite.config.js                  # Vite server & API proxy config (port 5173)
```

---

## 🚀 Quick Setup & Run Instructions

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js (v18+)** installed
- **MySQL 8.0+** (or **XAMPP** / **WAMP** / MySQL Windows Service)

---

### 2. Install Dependencies

#### Backend (Python):
```bash
py -m pip install -r requirements.txt
```

#### Frontend (Node):
```bash
npm install
```

---

### 3. Configure MySQL Database

1. Start your **MySQL Server** (e.g. open XAMPP and start MySQL, or start the MySQL service).
2. Create or verify your `.env` file in the project root:
```env
PORT=5000
SECRET_KEY=placementhub_super_secret_jwt_key_2026_mlrit
JWT_SECRET_KEY=placementhub_jwt_secure_token_secret_2026

# Administrator Access Code for Admin Signup
ADMIN_ACCESS_CODE=MLRIT@2026

# MySQL Connection Details
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=placementhub
```
*(If your MySQL `root` user has a password, specify it in `MYSQL_PASSWORD`)*.

3. Run the automated database initialization script:
```bash
py init_mysql.py
```
*This script automatically creates the `placementhub` database, all 21 tables, and seeds initial data (Super Admin account, sample drives, jobs, training classes, announcements, and certifications).*

> **Alternative (Manual SQL Import):**
> You can also import `backend/schema.sql` directly into MySQL Workbench or phpMyAdmin.

---

### 4. Run the Project

#### Option A: Running Both Servers in Separate Terminals

**Terminal 1 — Backend (Flask API on port 5000):**
```bash
py run.py
```
*(or `npm run server`)*

**Terminal 2 — Frontend (Vite Dev Server on port 5173):**
```bash
npm run dev
```

#### Option B: Access the Web Application
Open your browser and navigate to:
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **Login / Signup**: [http://localhost:5173/login](http://localhost:5173/login)
- **Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Credentials & Authentication

### Default Super Admin Account:
- **Email**: `faculty.placement@mlrit.ac.in`
- **Password**: `AdminSecure@2026`
- **Portal**: Admin Portal

### Default Sample Student Account:
- **Email**: `22r11a0599@mlrit.ac.in`
- **Student ID**: `22R11A0599`
- **Password**: `StudentSecure@2026`
- **Portal**: Student Portal

---

## 📋 Business Logic & Validation Rules

1. **Student Registration**:
   - **No verification code required** during student signup or login. Accounts are instantly active.
   - **Domain restriction**: Must be an `@mlrit.ac.in` college email.
   - **Student ID match**: Student ID prefix must strictly match the email username (e.g., `22R11A0501` and `22r11a0501@mlrit.ac.in`).
   - **Departments allowed**: Exactly `CSE`, `CSE-AI/ML`, `CSE-DS`, `ECE`, `EEE`, `MECH`, `AERO`.
   - **Sections allowed**: `A`, `B`, `C`, `D`, `E`, `F`, `G`.
   - **Years allowed**: `3rd Year`, `4th Year`.
   - **Password complexity**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character.

2. **Admin Registration**:
   - Requires the shared admin access code (`MLRIT@2026`) stored in backend environment variables.
   - **Mandatory 6-digit email verification** sent to the administrator's official email address. Admin accounts remain blocked (`403 Forbidden`) until verified.

3. **Data Access & Authorization**:
   - **Students**: Can register/deregister for placement drives, apply for jobs and internships, submit queries, write interview reviews, view personal attendance and test scores, and update their personal profile.
   - **Admins**: Can create/edit/delete placement drives, jobs, internships, training classes, assessment exams, and announcements, manage student records, update student attendance scores, and reply to student queries.

---

## 🧪 Testing the Backend

Run the automated 23-test backend integration suite:
```bash
py backend/test_backend.py
```
This tests health check, validation rejections (department, section, year), student instant registration, admin code gating, admin verification flow, role protections, and CRUD operations across all entities.
