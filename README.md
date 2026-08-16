# 📘 TaxPal-Batch2

# TaxPal

TaxPal is a full-stack web application designed to help freelancers and self-employed individuals manage their finances efficiently. The application enables users to track income and expenses, manage transactions, estimate taxes, manage budgets, categorize expenses, manage reminders, and generate financial insights through an interactive dashboard and AI-powered financial assistant.

---

# 🚀 Tech Stack

## Frontend

- Angular
- TypeScript
- HTML
- CSS

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas
- Mongoose

## AI

- Google Gemini API
- AI-powered TaxPal Financial Assistant

---

# 📁 Project Structure

```text
TaxPal-Batch2
│
├── frontend/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── chatbot/
│   │   │   │   ├── navbar/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── transactions/
│   │   │   │   ├── budgets/
│   │   │   │   ├── tax-estimator/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── reminders/
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── transactions/
│   │   │   │   ├── budgets/
│   │   │   │   ├── tax-estimator/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── reminders/
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── transaction.service.ts
│   │   │   │   ├── budget.service.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   ├── tax.service.ts
│   │   │   │   ├── report.service.ts
│   │   │   │   ├── reminder.service.ts
│   │   │   │   └── chatbot.service.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── transaction.model.ts
│   │   │   │   ├── budget.model.ts
│   │   │   │   ├── category.model.ts
│   │   │   │   ├── tax-estimate.model.ts
│   │   │   │   ├── reminder.model.ts
│   │   │   │   └── chatbot.model.ts
│   │   │   │
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.css
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── assets/
│   │   ├── environments/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   │
│   ├── angular.json
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── .gitignore
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   ├── budgetController.js
│   │   │   ├── categoryController.js
│   │   │   ├── taxController.js
│   │   │   ├── reminderController.js
│   │   │   ├── reportController.js
│   │   │   └── chatController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   ├── Budget.js
│   │   │   ├── Category.js
│   │   │   ├── TaxEstimate.js
│   │   │   ├── Alert.js
│   │   │   └── ChatHistory.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── taxRoutes.js
│   │   │   ├── reminderRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── chatRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── transactionService.js
│   │   │   ├── budgetService.js
│   │   │   ├── categoryService.js
│   │   │   ├── taxService.js
│   │   │   ├── reminderService.js
│   │   │   ├── reportService.js
│   │   │   ├── geminiService.js
│   │   │   └── chatService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── defaultCategories.js
│   │   │   ├── taxCalculator.js
│   │   │   └── reportGenerator.js
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── transactionValidator.js
│   │   │   ├── budgetValidator.js
│   │   │   ├── categoryValidator.js
│   │   │   └── taxValidator.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
│
└── README.md
# Core Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Current User Management
- User Ownership Enforcement

## 💳 Transaction Management

- Add Income
- Add Expenses
- View Transactions
- Update Transactions
- Delete Transactions
- Transaction Categorization
- Transaction History

## 💰 Budget Management

- Create Budgets
- View Budgets
- Update Budgets
- Delete Budgets
- Budget Progress Tracking
- Category-based Budget Management

## 🏷️ Category Management

- Create Categories
- Update Categories
- Delete Categories
- Default Categories
- Category Suggestions
- Duplicate Category Prevention

## 🧾 Tax Estimation

- Tax Estimation
- Country and Region Selection
- Tax Slab-based Calculation
- Quarterly Tax Estimation
- Tax Summary
- Tax Payment Information

## 📅 Reminders & Calendar

- Tax Reminders
- Payment Reminders
- Calendar View
- Upcoming Reminder Tracking
- Alert Management

## 📊 Reports & Financial Insights

- Financial Summaries
- Expense Analysis
- Income Analysis
- Budget Analysis
- Tax Reports
- Financial Report Generation
- PDF Reports
- Excel Export

---

# 🤖 AI Financial Assistant

TaxPal includes an AI-powered financial assistant that allows users to interact with their financial information using natural language.

## AI Assistant Capabilities

- Natural language financial queries
- Budget analysis
- Transaction analysis
- Tax assistance
- Reminder assistance
- Financial summaries
- Report generation
- PDF download actions
- Excel export actions
- Navigation actions
- Chat history
- Suggested questions
- Personalized responses based on authenticated user data

## Example Queries

```text
How much did I spend this month?

What's my remaining budget?

Which category did I spend the most on?

Explain my tax estimate.

Show my upcoming reminders.

Generate my monthly financial report.

Export my transactions to Excel.
# 🧠 AI Architecture

TaxPal AI follows a secure backend-based architecture where the Angular frontend communicates with the Express backend, while the backend handles communication with the Gemini API and MongoDB.

```text
Angular Frontend
       │
       ▼
TaxPal AI Chatbot
       │
       ▼
POST /api/chat
       │
       ▼
Express Backend
       │
       ├── JWT Authentication
       │
       ├── User Data
       ├── Transactions
       ├── Budgets
       ├── Tax Estimates
       ├── Reminders
       └── Reports
       │
       ▼
Gemini API
       │
       ▼
Structured AI Response
       │
       ▼
Angular Chatbot
🔀 Git Workflow
Every team member works on their own Git branch.
Changes are pushed to individual branches.
Pull Requests are created for completed work.
Code is reviewed before merging.
Changes are tested before merging.
The main branch contains the latest stable implementation.
Team members pull the latest changes from main before starting new work.
👥 Development Workflow
Pull the latest changes from the main branch.
Switch to the respective development branch.
Complete the assigned task.
Test the implementation locally.
Commit and push the changes.
Create a Pull Request.
Review the implementation.
Resolve issues or merge conflicts if required.
Merge the verified changes into main.
⚙️ Backend Overview

The Express.js backend handles:

Authentication
Authorization
Transaction Management
Budget Management
Category Management
Tax Estimation
Reminder Management
Report Generation
AI Chatbot APIs
MongoDB Operations
Request Validation
Business Logic
💻 Frontend Overview

The Angular frontend provides:

Authentication Interface
Financial Dashboard
Transaction Management
Budget Management
Category Management
Tax Estimation
Calendar and Reminders
Reports and Exports
Settings
TaxPal AI Assistant
Responsive User Interface
⚙️ Environment Configuration

Create a .env file inside the backend directory.

Environment Variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
MONGO_URI - MongoDB Atlas connection string.
JWT_SECRET - Secret key used for JWT authentication.
GEMINI_API_KEY - Gemini API key used by the AI Financial Assistant.
GEMINI_MODEL - Gemini model used by the chatbot.

Important: Never commit the actual .env file or API credentials to GitHub.

Use .env.example to share the required environment variables with the team.

📝 Notes
The project follows a modular frontend, backend, and database architecture.
Angular is used for frontend development.
Node.js and Express.js are used for backend API development.
MongoDB Atlas is used as the cloud database.
Mongoose is used for MongoDB object modeling.
JWT is used for authentication and authorization.
Parallel development is followed across the development teams.
Regular code reviews and testing are performed before merging changes.
Project documentation is maintained throughout development.
The AI assistant communicates with the LLM through the backend.
AI API credentials are stored securely using environment variables.
The chatbot only accesses data belonging to the authenticated user.
Financial calculations are handled by the backend wherever applicable.
AI-generated actions are validated by the backend before execution.
🚀 Project Status

TaxPal is a full-stack personal finance and tax management platform that provides users with tools to manage their finances, estimate taxes, track budgets, manage reminders, generate reports, and interact with an AI-powered financial assistant.

Current Features
✅ Authentication & Authorization
✅ User Registration & Login
✅ JWT Authentication
✅ Transaction Management
✅ Income Management
✅ Expense Management
✅ Budget Management
✅ Budget Progress Tracking
✅ Category Management
✅ Default Categories
✅ Category Suggestions
✅ Tax Estimation
✅ Country & Region Selection
✅ Tax Slab-Based Calculation
✅ Quarterly Tax Estimation
✅ Tax Summary
✅ Tax Reminders
✅ Calendar & Reminder Management
✅ Financial Reports
✅ PDF Report Generation
✅ Excel Export
✅ MongoDB Atlas Integration
✅ Angular Frontend
✅ Express.js Backend
✅ RESTful APIs
✅ Frontend-Backend Integration
✅ AI Financial Assistant
✅ Gemini API Integration
✅ Natural Language Financial Queries
✅ Budget & Transaction Analysis
✅ Tax Assistance
✅ Reminder Assistance
✅ Interactive Chatbot Actions
✅ Report Download Actions
✅ Navigation Actions
✅ Chat History
✅ Suggested Questions
✅ End-to-End Testing
👥 Team

Project: TaxPal – Personal Finance & Tax Estimator

Frontend Team
Sachin Shekhar (Team Lead)
Debjani Roy
Jalal Jasmine
Backend Team
Varshistha Gopalam
Rehan Shaik
Database Team
Jainee Jain
👨‍💼 Maintained By

Sachin Shekhar

Team Lead – TaxPal Project
