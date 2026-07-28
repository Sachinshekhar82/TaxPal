# TaxPal - Frontend Architecture & Integration Guide

Welcome to the frontend repository for **TaxPal**, a personal finance and tax estimation platform built specifically for freelancers. This document outlines the frontend architecture and provides comprehensive instructions for the Backend and Database teams to successfully integrate their systems to complete **Milestone 1**.

---

## 🏛️ Frontend Architecture Overview

The frontend is built using **Angular** leveraging the modern **Standalone Components** architecture. This entirely eliminates `NgModules`, resulting in a highly modular, lightweight, and incredibly fast application.

### 1. Technology Stack
*   **Framework**: Angular (Standalone Architecture)
*   **Reactivity**: RxJS (Observables for seamless async data streams)
*   **Styling**: Pure CSS3 with custom variables (No heavy external frameworks like Bootstrap/Tailwind)
*   **Routing**: Angular Router (Nested layout routing)

### 2. Core Folder Structure
```text
src/
├── app/
│   ├── auth/                 # Login & Registration flows
│   ├── core/
│   │   └── services/         # State management & Mock API Data sources
│   ├── dashboard/            # Dynamic charts, metrics, and summaries
│   ├── layout/               # Global shell (Sidebar, Navbar, Coming Soon pages)
│   └── transactions/         # Dynamic forms for Income/Expense & Master Ledger
├── styles.css                # Global design system, theme tokens, and animations
```

### 3. State Management & Data Flow
Currently, the application relies on **Mock Services** located in `src/app/core/services/`.
*   These services (`auth.ts`, `transaction.ts`, `dashboard.ts`) house hardcoded data arrays and simulate network latency.
*   **Crucially, all mock methods return RxJS `Observables` (e.g., `of(...).pipe(delay(...))`).**
*   Because the frontend components already subscribe to these Observables asynchronously, the UI components **do not need to be changed at all** when real HTTP requests are introduced.

### 4. UI & Theming System
*   **Responsive**: Mobile-first media queries handle the sidebar toggle natively.
*   **Dynamic Theming**: Driven entirely by CSS Variables in `styles.css`. Clicking the theme toggle switches `data-theme="dark"` on the `<body>`, instantly inverting colors.
*   **Localization**: The UI dynamically tracks the user's country code to inject the proper currency symbol (`$`, `₹`, `£`, etc.) across all dashboards and tables.

---

## 🔗 Backend & Database Integration Guide (Tax Estimate Module)

This section outlines how the Backend (Node.js/Express) and Database (MongoDB/Mongoose) teams should integrate the **Tax Estimate Module** implemented in the frontend. Other core flows (Auth, Transactions, and Dashboard summaries) are already fully integrated.

### Step 1: Database Model Reference
The Database team should verify and leverage the existing schema in `backend/src/models/TaxEstimate.js` for storing quarterly estimates:

```javascript
const taxEstimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    country: { type: String, required: true },
    state: { type: String, default: "" },
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    filingStatus: { type: String, default: "" },
    grossIncome: { type: Number, required: true },
    deductions: {
      businessExpenses: { type: Number, default: 0 },
      retirementContribution: { type: Number, default: 0 },
      healthInsurancePremiums: { type: Number, default: 0 },
      homeOfficeDeduction: { type: Number, default: 0 },
    },
    estimatedTax: { type: Number, required: true },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);
```

### Step 2: API Endpoints to Expose
The Backend team needs to create `taxEstimateRoutes.js` and register it under `/api/tax-estimates` in `app.js`. Implement the following protected routes (requiring the authentication `protect` middleware):

#### 1. `POST /api/tax-estimates`
Saves a new calculated tax estimate for the authenticated user.
*   **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Request Payload**:
    ```json
    {
      "country": "IN",
      "state": "MH",
      "quarter": "Q1",
      "filingStatus": "Married (Joint)",
      "grossIncome": 500000,
      "deductions": {
        "businessExpenses": 50000,
        "retirementContribution": 0,
        "healthInsurancePremiums": 0,
        "homeOfficeDeduction": 0
      },
      "estimatedTax": 40000,
      "dueDate": "2026-04-15T00:00:00.000Z"
    }
    ```
*   **Response Payload (`201 Created`)**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "603f9a7d9b1d8e123456789a",
        "userId": "603f9a7d9b1d8e123456789b",
        "country": "IN",
        "state": "MH",
        "quarter": "Q1",
        "filingStatus": "Married (Joint)",
        "grossIncome": 500000,
        "deductions": {
          "businessExpenses": 50000,
          "retirementContribution": 0,
          "healthInsurancePremiums": 0,
          "homeOfficeDeduction": 0
        },
        "estimatedTax": 40000,
        "dueDate": "2026-04-15T00:00:00.000Z",
        "createdAt": "2026-07-28T14:00:16.000Z",
        "updatedAt": "2026-07-28T14:00:16.000Z"
      }
    }
    ```

#### 2. `GET /api/tax-estimates`
Retrieves all previously calculated and saved tax estimates for the authenticated user, sorted by creation date or quarter.
*   **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "603f9a7d9b1d8e123456789a",
          "userId": "603f9a7d9b1d8e123456789b",
          "country": "IN",
          "state": "MH",
          "quarter": "Q1",
          "filingStatus": "Married (Joint)",
          "grossIncome": 500000,
          "deductions": {
            "businessExpenses": 50000,
            "retirementContribution": 0,
            "healthInsurancePremiums": 0,
            "homeOfficeDeduction": 0
          },
          "estimatedTax": 40000,
          "dueDate": "2026-04-15T00:00:00.000Z",
          "createdAt": "2026-07-28T14:00:16.000Z"
        }
      ]
    }
    ```

#### 3. `DELETE /api/tax-estimates/:id`
Deletes a specific tax estimate record by ID.
*   **Request Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Response Payload (`200 OK`)**:
    ```json
    {
      "success": true,
      "message": "Tax estimate deleted successfully"
    }
    ```

---

### Step 3: Tax Calculation Logic (For Reference & Dashboard Integration)
The backend service calculating dynamic estimation (such as dashboard summary estimates) should align with the frontend country-specific calculation parameters.

#### India (IN) - New Tax Regime (Updated 2026)
*   **Tax-Free Limit**: Up to ₹4,00,000 (Nil)
*   **Brackets & Rates**:
    *   ₹0 – ₹4,00,000: **0%** (Nil)
    *   ₹4,00,001 – ₹8,00,000: **5%**
    *   ₹8,00,001 – ₹12,00,000: **10%**
    *   ₹12,00,001 – ₹16,00,000: **15%**
    *   ₹16,00,001 – ₹20,00,000: **20%**
    *   ₹20,00,001 – ₹24,00,000: **25%**
    *   Above ₹24,00,000: **30%**

#### United States (US)
*   **Single**:
    *   Up to \$11,600: **10%**
    *   \$11,600 – \$47,150: **12%**
    *   \$47,150 – \$100,525: **22%**
    *   \$100,525 – \$191,950: **24%**
    *   Above \$191,950: **32%**
*   **Married (Joint)**:
    *   Up to \$23,200: **10%**
    *   \$23,200 – \$94,300: **12%**
    *   \$94,300 – \$201,050: **22%**
    *   Above \$201,050: **24%**

#### Canada (CA)
*   Up to \$55,867: **15%**
*   \$55,867 – \$111,733: **20.5%**
*   \$111,733 – \$173,205: **26%**
*   Above \$173,205: **29%**

#### United Kingdom (UK)
*   Up to £12,570: **0%** (Personal Allowance)
*   £12,570 – £50,270: **20%** (Basic rate)
*   £50,270 – £125,140: **40%** (Higher rate)
*   Above £125,140: **45%** (Additional rate)

#### Australia (AU)
*   Up to AU\$18,200: **0%**
*   AU\$18,200 – AU\$45,000: **16%**
*   AU\$45,000 – AU\$120,000: **30%**
*   AU\$120,000 – AU\$180,000: **37%**
*   Above AU\$180,000: **45%**

---

### Step 4: Frontend Integration Flow
A frontend engineer will build a `TaxEstimateService` to swap the local state bindings for real HTTP requests to the backend endpoints documented above:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaxEstimate {
  id?: string;
  country: string;
  state?: string;
  quarter: string;
  filingStatus: string;
  grossIncome: number;
  deductions: {
    businessExpenses: number;
    retirementContribution: number;
    healthInsurancePremiums: number;
    homeOfficeDeduction: number;
  };
  estimatedTax: number;
  dueDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaxEstimateService {
  private apiUrl = `${environment.apiUrl}/tax-estimates`;

  constructor(private http: HttpClient) {}

  saveEstimate(estimate: TaxEstimate): Observable<any> {
    return this.http.post<any>(this.apiUrl, estimate);
  }

  getEstimates(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  deleteEstimate(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 🚀 Running the Frontend Locally

1. **Prerequisites**: Ensure you have Node.js installed.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm start
   ```
4. **View App**: Open your browser and navigate to `http://localhost:4200/`. The app supports live-reloading upon file saves.
