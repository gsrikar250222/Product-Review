# Reviewly 🛍️

**Reviewly** is an AI-powered product review aggregator, sentiment analyzer, and price comparison platform. It crawls product ratings, extracts pros and cons, provides theme-based review breakdowns, and compares prices across online retailers.

---

## 🚀 Features

- **Multi-Source Review Scraping**: Real-time product search and review extraction via SerpAPI.
- **AI Sentiment & Aspect Analysis**: HuggingFace NLP integration to categorize sentiment and user feedback into themes (Durability, Value, Usability, etc.).
- **Price Comparison**: Compare pricing and availability across top online stores.
- **Cross-Platform Support**: Built for both Web and Android using React + Vite + Capacitor.
- **Fast Async Backend**: FastAPI architecture with SQLite/aiosqlite database caching.

---

## 📁 Project Structure

```
varu_project/
├── backend/               # FastAPI backend API
│   ├── app/               # Application logic (routers, models, providers, services)
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Sample environment configuration
├── frontend/              # React + Vite + Capacitor frontend
│   ├── src/               # React components and pages
│   ├── android/           # Capacitor Android native project
│   └── package.json       # Frontend dependencies
├── build_apk.ps1          # Automated Android APK build script
└── README.md              # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- (Optional for Android) Android Studio & JDK 17+

---

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your SerpAPI and HuggingFace API keys

# Start development server
uvicorn app.main:app --reload --port 8000
```

The API will be accessible at: `http://localhost:8000` (Docs at `http://localhost:8000/docs`).

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will run at: `http://localhost:5173`.

---

### 3. Android App Build

To build the debug Android APK:

```powershell
# In project root:
.\build_apk.ps1
```

The generated APK will be placed at the project root as `Reviewly.apk`.

---

## 📄 License

This project is licensed under the MIT License.
