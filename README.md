# TaxPal-Batch2

# TaxPal

TaxPal is a full-stack web application designed to help freelancers and self-employed individuals manage their finances efficiently. The application enables users to track income and expenses, manage transactions, estimate taxes, manage budgets, categorize expenses, generate financial reports, and interact with an AI-powered financial assistant.

---

# 🤖 AI Financial Assistant

TaxPal includes an **AI Financial Assistant** powered by the Google Gemini API (`gemini-2.5-flash`), built cleanly into the existing Angular + Node.js + MongoDB architecture.

### Key Capabilities
- 💬 **Personalized Financial Intelligence**: Answers questions using only the logged-in user's authenticated transactions, income, expenses, budgets, tax estimates, and reminders.
- 📄 **Direct Report Downloads**: Triggers report generation directly inside chat messages and renders `[ Download PDF ]` and `[ Download CSV ]` action buttons for instant file downloads.
- 🧭 **In-App Navigation**: Supports navigation prompts ("Open my budgets", "Take me to tax estimator") with clickable `[ Open Page ]` buttons using Angular Router.
- 📊 **Visual Data Cards**: Renders interactive UI cards for budget summaries, tax calculation breakdowns, and spending distributions directly within assistant response bubbles.
- 🔒 **Enterprise-Grade Security & Isolation**: The Gemini API key is kept strictly on the backend (`process.env.GEMINI_API_KEY`). Gemini is never given direct database or query execution access; the Express backend performs all calculations and enforces strict JWT user data scoping (`req.user.id`).

### Backend Environment Configuration
Add the following to `backend/.env`:

```env
GEMINI_API_KEY=your_real_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

# 🚀 Tech Stack

## Frontend
- Angular
- TypeScript
- HTML
- CSS
- Phosphor Icons

## Backend
- Node.js
- Express.js
- `@google/generative-ai` SDK
- PDFKit & CSV generation engines

## Database
- MongoDB Atlas
- Mongoose

---

# 📁 Project Structure

```text
TaxPal-Batch2
│
├── frontend/
│   ├── src/app/
│   │   ├── core/services/chat.service.ts
│   │   ├── layout/chatbot/
│   │   │   ├── chatbot.ts
│   │   │   ├── chatbot.html
│   │   │   └── chatbot.css
│   │   └── layout/layout/
│
├── backend/
│   ├── src/
│   │   ├── controllers/chatController.js
│   │   ├── models/ChatHistory.js
│   │   ├── routes/chatRoutes.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── chatService.js
│   │   │   └── chatActionService.js
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   ├── .gitignore
│   └── .env.example
│
└── README.md
```

---

# 📌 Features Summary

- ✅ **User Authentication**: Register, Login, JWT tokens & protected routes.
- ✅ **Transactions**: Income and expense tracking with category classification.
- ✅ **Budgets**: Budget creation, limits, spending progress & threshold warnings.
- ✅ **Tax Estimation**: Quarterly tax calculation engine based on country/regional slabs.
- ✅ **Tax Calendar & Reminders**: Due date tracking, pending payment status, alert notifications.
- ✅ **Financial Reports**: Income statement, tax summary, budget performance reports with PDF & CSV downloads.
- ✅ **AI Financial Assistant**: Floating chatbot with Gemini 2.5 Flash, structured action buttons, visual data cards, and chat history.

---

# 👨‍💻 Team

**Project:** TaxPal – Personal Finance & Tax Estimator

## Frontend Team
- Sachin Shekhar (Team Lead)
- Debjani Roy
- Jalal Jasmine

## Backend Team
- Varshistha Gopalam
- Rehan Shaik

## Database Team
- Jainee Jain
