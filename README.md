# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A complete HRMS solution built for hackathons with clean architecture, role-based access control, and comprehensive employee management features.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Railway hosted)
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Express-validator
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## ✨ Features

### Core Functionality
- ✅ **Authentication & Authorization**
  - JWT-based auth with access and refresh tokens
  - Auto-generated login IDs (format: OIJODO20260001)
  - Auto-generated secure passwords for new employees
  - First-time password change enforcement
  - Role-based access control (Admin/HR/Employee)

- ✅ **Employee Management**
  - Complete employee profile management
  - Profile picture upload
  - Bank details management
  - Skills and certifications tracking
  - Manager assignment
  - Role-based field editing permissions

- ✅ **Attendance System**
  - Daily check-in/check-out functionality
  - Real-time status tracking (🟢 Present, 🟡 Absent, ✈️ On Leave)
  - Automatic work hours calculation
  - Break time deduction
  - Extra hours tracking
  - Monthly/yearly attendance views
  - Admin oversight of all employee attendance

- ✅ **Leave Management**
  - Multiple leave types (Paid, Sick, Unpaid)
  - Leave request submission with date range
  - Automatic leave balance checking
  - Approval/rejection workflow for Admin/HR
  - Leave allocations per year
  - Automatic attendance marking on leave approval

- ✅ **Payroll/Salary Management**
  - Automatic salary component calculation
  - Configurable salary structure:
    - Basic Salary: 50% of wage
    - HRA: 50% of basic
    - Standard Allowance: Fixed ₹4,167
    - Performance Bonus: 8.33% of wage
    - LTA: 8.33% of wage
    - Fixed Allowance: Auto-calculated
    - PF (Employee & Employer): 12% of basic each
    - Professional Tax: Fixed ₹200
  - Monthly and yearly wage calculation
  - Read-only view for employees
  - Full edit access for Admin/HR

## 📁 Project Structure

```
Odoo_Human_Resource_Management_2026/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── seed.ts                 # Seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts         # Prisma client
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts  # Auth logic
│   │   │   ├── employee.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── leave.controller.ts
│   │   │   └── salary.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT verification
│   │   │   ├── role.ts             # Role-based access
│   │   │   ├── validation.ts       # Input validation
│   │   │   └── error.ts            # Error handling
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   ├── attendance.routes.ts
│   │   │   ├── leave.routes.ts
│   │   │   └── salary.routes.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts              # Token generation
│   │   │   ├── password.ts         # Password utilities
│   │   │   ├── loginId.ts          # Login ID generator
│   │   │   └── salary.ts           # Salary calculations
│   │   └── index.ts                # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Root layout
    │   │   ├── page.tsx            # Landing page
    │   │   ├── signin/             # Sign in page
    │   │   ├── dashboard/          # Dashboard
    │   │   ├── profile/            # Employee profile
    │   │   ├── employees/          # Employee list
    │   │   ├── attendance/         # Attendance management
    │   │   ├── leave/              # Leave management
    │   │   └── salary/             # Salary information
    │   ├── components/
    │   │   ├── ui/                 # Shadcn/UI components
    │   │   └── layout/             # Layout components
    │   ├── lib/
    │   │   ├── api.ts              # Axios instance
    │   │   └── utils.ts            # Utility functions
    │   └── store/
    │       └── authStore.ts        # Auth state management
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── .env.example
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Railway or local)
- npm or yarn package manager

### 1. Clone and Install

```bash
# Navigate to project directory
cd Odoo_Human_Resource_Management_2026

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup (Railway)

See [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for detailed instructions.

**Quick steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project → Provision PostgreSQL
3. Copy the `DATABASE_URL` from the PostgreSQL service
4. Use it in your backend `.env` file

### 3. Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your values
# Required variables:
# - DATABASE_URL (from Railway)
# - JWT_ACCESS_SECRET (random secret)
# - JWT_REFRESH_SECRET (random secret)
```

Example `.env`:
```env
DATABASE_URL="postgresql://postgres:password@host:port/railway"
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=5000
NODE_ENV=development
COMPANY_CODE="OI"
COMPANY_NAME="Odoo India"
```

### 4. Database Migration & Seed

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with initial data(admin user + sample employee)
npm run prisma:seed
```

**Seed creates:**
- Admin user: Login ID `OIADMI20260001`, Password: `Admin@123`
- Sample employee: Login ID `OIJODO20260001`, Password: `Employee@123`

### 5. Frontend Configuration

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Edit .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
```

Example `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 6. Run the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## 🔑 Default Credentials

After seeding the database:

**Admin**
- Login ID: `OIADMI20260001`
- Password: `Admin@123`

**Sample Employee**
- Login ID: `OIJODO20260001`
- Password: `Employee@123` (first-time password change required)

## 🎯 Key Features by Role

### Admin / HR Officer
- ✅ Create new employees (auto-generates login ID & password)
- ✅ View all employee profiles and edit all fields
- ✅ View all attendance records with filters
- ✅ Approve/reject leave requests
- ✅ Manage leave allocations
- ✅ Update salary information for all employees
- ✅ View salary breakdowns

### Employee
- ✅ View and edit own profile (limited fields)
- ✅ Check-in/check-out daily
- ✅ View own attendance history
- ✅ Request time off/leave
- ✅ View leave balance and history
- ✅ View own salary information (read-only)
- ✅ Manage skills and certifications

## 📊 Salary Calculation Logic

The system automatically calculates all salary components based on monthly wage:

```
Monthly Wage: ₹50,000

Components:
├─ Basic Salary:        ₹25,000 (50% of wage)
├─ HRA:                 ₹12,500 (50% of basic)
├─ Standard Allowance:  ₹4,167  (fixed)
├─ Performance Bonus:   ₹4,165  (8.33% of wage)
├─ LTA:                 ₹4,165  (8.33% of wage)
└─ Fixed Allowance:     ₹3      (remaining amount)

Deductions:
├─ PF (Employee):       ₹3,000  (12% of basic)
├─ PF (Employer):       ₹3,000  (12% of basic)
└─ Professional Tax:    ₹200    (fixed)

Yearly Wage: ₹6,00,000
```

## 🔐 Login ID Format

Auto-generated in format: `OIJODO20260001`

- `OI` → Company Code (Odoo India)
- `JODO` → First 2 letters of first name + first 2 letters of last name
- `2026` → Year of joining
- `0001` → Serial number for the year

## 🎨 UI/UX Features

- Modern, clean interface with Shadcn/UI components
- Responsive design (mobile, tablet, desktop)
- Real-time status indicators:
  - 🟢 Green dot: Employee is present
  - 🟡 Yellow dot: Employee is absent
  - ✈️ Airplane icon: Employee is on leave
- Toast notifications for actions
- Form validation with helpful error messages
- Loading states and skeletons

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create employee (Admin only)
- `POST /api/auth/signin` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password

### Employees
- `GET /api/employees` - List employees
- `GET /api/employees/me` - Get own profile
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `PUT /api/employees/:id/bank-details` - Update bank details
- `GET /api/employees/:id/skills` - Get skills
- `POST /api/employees/:id/skills` - Add skill
- `DELETE /api/employees/:id/skills/:skillId` - Remove skill

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Leave
- `POST /api/leaves` - Request leave
- `GET /api/leaves` - List leave requests
- `PUT /api/leaves/:id/approve` - Approve leave (Admin)
- `PUT /api/leaves/:id/reject` - Reject leave (Admin)
- `GET /api/leaves/allocations` - Get leave allocations
- `POST /api/leaves/allocations` - Create allocation (Admin)

### Salary
- `GET /api/salary/:employeeId` - Get salary info
- `PUT /api/salary/:employeeId` - Update salary (Admin)
- `POST /api/salary/calculate` - Calculate components (Admin)

## 🧪 Testing

1. **Authentication Flow**
   - Sign in with admin credentials
   - Create a new employee
   - Sign in with new employee (first-time password change)

2. **Attendance**
   - Check in as employee
   - Verify status changes to Present (🟢)
   - Check out after some time
   - Verify work hours calculated correctly

3. **Leave Management**
   - Request leave as employee
   - Sign in as admin
   - Approve/reject leave request
   - Verify leave balance updates

4. **Salary Management**
   - Sign in as admin
   - Update employee salary
   - Verify all components calculated correctly
   - Sign in as employee
   - Verify read-only view

## 🚢 Deployment

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy backend service

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` to Railway backend URL
3. Deploy

## 🤝 Contributing

This is a hackathon project. Feel free to fork and modify as needed!

## 📄 License

MIT License - feel free to use this project for learning or hackathons.

## 🙋‍♂ Support

For issues or questions, please check the implementation plan and database schema in the project.

---

**Built with ❤️ for hackathons**

