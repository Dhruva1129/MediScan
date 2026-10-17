# MediScan — AI-Powered Medical Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google)](https://ai.google.dev)

MediScan is a full-stack medical intelligence platform that translates complex medical reports, clinical symptoms, and healthcare discovery into clear, actionable, visual insights.

---

## 🌟 Key Features

1. **📄 Medical Report Analyzer**
   - Ingests medical documents (PDFs, scans, JPG, PNG) using a fast, two-step stateless extraction pipeline.
   - Generates 4 structured analytical sections:
     - **Executive Summary** (body system, key findings in plain language)
     - **Risk Analysis** (overall risk, immediate urgency, daily life impact)
     - **Next Steps** (safe lifestyle, monitoring, follow-up actions)
     - **Ask Doctor** (precise bullet questions to ask your physician)
   - Export report directly as a branded PDF.

2. **📊 Visual Health Reports & Biomarkers**
   - Synthesizes patient demographics (Age, Gender, Weight) and medical report data.
   - Interactive SVG dashboard:
     - 0–100 Composite Health Score with circular SVG gauge
     - Risk level badge (Low / Moderate / High)
     - Multi-segment risk breakdown donut chart
     - Category breakdown bars (Blood Health, Cardiac, Immunity)
     - Key biomarker metric cards with standard reference ranges
     - Actionable recommendations & historical patient tracking.

3. **💬 Context-Aware Conversational AI**
   - Interactive multi-turn chat anchored to any previously analyzed medical report.
   - Remembers past conversational context and answers follow-up questions in natural language.

4. **🩺 Patient Symptom Triage & Specialist Diagnosis**
   - Input patient demographics, symptoms, and duration.
   - AI generates an overarching clinical analysis and identifies the exact specialist doctor required (e.g. *Cardiologist, Neurologist, Dermatologist*).
   - Instant 1-click bridge to find matching hospitals and specialists.

5. **🏥 Hospital & Doctor Discovery Engine**
   - Search top hospitals and rated specialists based on location and doctor specialty.
   - In-depth detail modal covering hospital reputation, doctor background, facilities, and visit preparation.

6. **🌍 Multilingual Translation**
   - Translates all 4 report analysis pillars concurrently into any target language (e.g., Hindi, Spanish, French, Telugu).

7. **🔐 Flexible Authentication**
   - Sign up with username & password or log in passwordless using a 4-digit Email OTP delivered via SMTP.

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 Complete Technical Documentation

For complete architectural details, database ER diagrams, API endpoint specifications, and prompt designs, refer to the [DOCUMENTATION.md](DOCUMENTATION.md) file.