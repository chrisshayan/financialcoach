# Financial Coach POC - Neuro-Symbolic Architecture

A proof-of-concept demonstrating a Neuro-Symbolic AI architecture for financial coaching. The LLM identifies financial intents, delegates calculations to a deterministic engine, and narrates results without hallucinating numbers.

## Architecture

**Neuro-Symbolic Flow:**
1. User asks a financial question (e.g., "Can I afford $400k?")
2. LangChain agent detects intent and calls appropriate tool
3. Deterministic calculator performs math (DTI, affordability, etc.)
4. LLM narrates results empathetically using only calculator outputs

**Tech Stack:**
- **Backend**: FastAPI + LangChain + OpenAI
- **Frontend**: Next.js 14 + Tailwind CSS
- **Data**: JSON mock files (no database)

## Quick Start

### Prerequisites

- Python 3.11, 3.12, or 3.13
- Node.js 18+
- OpenAI API key

**Note:** Python 3.13 is supported, but if you encounter build issues:
- Use Python 3.11 or 3.12 (most stable)
- Or ensure you have the latest pip: `pip install --upgrade pip`

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# If you get PyO3/tiktoken build errors with Python 3.13, use:
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
pip install -r requirements.txt

# Or use the install script:
# ./install.sh

# Create .env file
echo "OPENAI_API_KEY=your_key_here" > .env

# Run server
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

**Troubleshooting:** If you encounter `tiktoken` build errors:
- Use Python 3.11 or 3.12 (recommended)
- Or set `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` before installing

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Testing

```bash
cd backend
pytest
```

## Project Structure

```
financialcoach/
├── backend/
│   ├── app/
│   │   ├── agent/          # LangChain agent & tools
│   │   ├── calculator/     # Deterministic calculations
│   │   └── data/           # Mock user context
│   └── main.py             # FastAPI entry
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # Chat UI components
│   └── lib/                # API client
└── README.md
```

## Key Features

- **Intent Detection**: LangChain agent automatically detects financial intents
- **No Hallucination**: All numbers come from deterministic calculators
- **Contextual Conversations**: Remembers previous discussions and calculations
- **Streaming Responses**: Real-time chat experience
- **Rich UI**: Calculation cards, follow-up suggestions, visual breakdowns

## Environment Variables

Create `.env` in backend directory:
```
OPENAI_API_KEY=your_openai_api_key
```

## Testing

```bash
cd backend
pytest
```

## License

See LICENSE file.

