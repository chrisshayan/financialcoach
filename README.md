# Financial Coach POC - Neuro-Symbolic Architecture

A proof-of-concept demonstrating a Neuro-Symbolic AI architecture for financial coaching. The LLM identifies financial intents, delegates calculations to a deterministic engine, and narrates results without hallucinating numbers.

## Financial Mortgage Readiness Coach Demo
[![Financial Coach Demo](https://img.youtube.com/vi/hw-BSe4MB9Q/maxresdefault.jpg)](https://youtu.be/hw-BSe4MB9Q)

## Coach Marketplace Demo
[![Coach Marketplace Demo](https://img.youtube.com/vi/KdiD4Wl1UK4/maxresdefault.jpg)](https://youtu.be/KdiD4Wl1UK4)

## Credit Karma Coach Demo
[![Coach Marketplace Demo](https://img.youtube.com/vi/VNM8sB_JK0k/maxresdefault.jpg)](https://youtu.be/VNM8sB_JK0k)

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

## Demo Scenarios

Try these chat prompts to explore different features:

### Basic Financial Analysis
- **"What's my debt-to-income ratio?"** - Calculates DTI with visual gauge
- **"Can I afford a $400k home?"** - Checks affordability based on your financial profile
- **"What's my readiness score?"** - Generates overall homeownership readiness (0-100)
- **"Analyze my spending patterns"** - Categorizes transactions and detects overspending

### Goal Management
- **"Should I create an emergency fund goal?"** - AI recommends goal with auto-calculated target
- **"I want to save for retirement"** - Coach suggests retirement goal with timeline
- **"Help me plan for a down payment"** - Creates homeownership goal with monthly contribution
- **"What goals should I prioritize?"** - Coach analyzes your situation and recommends goals

### Action Planning
- **"Create my personalized action plan"** - Generates structured plan with priority actions and milestones
- **"What should I do next?"** - Coach suggests next steps based on your financial profile
- **"How can I improve my readiness score?"** - Provides actionable steps to increase score

### Transaction Analysis
- **"Where am I overspending?"** - Identifies spending categories exceeding budget
- **"Compare my spending to peers"** - Shows peer benchmarking data
- **"What are my biggest expenses?"** - Breaks down spending by category

### Coach Marketplace
- **"I'm looking for a house"** or **"Help me find a property"** - Triggers Zillow Coach recommendation
- **"I need a car loan"** or **"I want to buy a car"** - Triggers CarMax Coach recommendation
- **"What's my credit score?"** or **"How can I improve my credit?"** - Triggers Credit Karma Coach recommendation
- **"What credit cards can I get?"** or **"Help me build credit"** - Connects to Credit Karma Coach
  - "Show me the credit score simulator" or "What if I pay off $5,000 debt?"
  - "Show me my credit monitoring dashboard" or "What are my credit alerts?"
- Once connected, chat directly with specialized coaches for domain-specific advice:
  - **Zillow Coach**: Property search, neighborhood analysis, home value estimates
  - **CarMax Coach**: Car recommendations, auto loan pre-approval, financing options
  - **Credit Karma Coach**: Credit score analysis, credit card recommendations, credit building strategies, credit report insights

### AI Transparency
- Click **"Why this?"** on any recommendation to see:
  - Confidence scores
  - Supporting factors
  - Risk factors
  - Alternative options
  - Data sources used

### Scenario Planning
- **"What if I save $500 more per month?"** - Shows impact on readiness and timeline
- **"How would paying off my credit card affect my DTI?"** - Calculates DTI improvement
- **"What if I increase my down payment to $50k?"** - Shows affordability impact

### Personalized Onboarding
- On first visit, the coach suggests personalized questions based on your financial profile
- Example questions adapt to your situation (income, debt, savings, goals)

### Pro Tips
- The coach remembers your conversation context - ask follow-up questions naturally
- Use natural language - no need for specific commands
- The coach proactively suggests next steps after calculations
- All numbers come from verified calculators - no hallucinations!

## Key Business Features

### Neuro-Symbolic AI Architecture
- **Separation of Concerns**: LLM handles empathy and conversation, deterministic engine handles all calculations
- **Zero Number Hallucination**: All financial numbers come from verified calculators, never from LLM
- **Intent Detection**: Automatic detection of financial intents (DTI, affordability, readiness, etc.)

### Financial Analysis & Calculations
- **Debt-to-Income (DTI) Ratio**: Real-time calculation with visual gauge
- **Home Affordability Check**: Determines if a home price is affordable based on financial profile
- **Readiness Score (0-100)**: Overall homeownership readiness with breakdown (DTI, credit, savings, employment)
- **Transaction Analysis**: Spending patterns, overspending detection, peer benchmarking
- **Scenario Planning**: "What-if" analysis for financial decisions (increase savings, pay off debt, etc.)

### Goal Management System
- **Multi-Goal Support**: Homeownership, retirement, education, debt payoff, emergency fund, major purchase
- **AI-Powered Goal Recommendations**: Coach suggests goals based on financial context
- **Goal Wizard**: Create and edit goals with timelines, targets, and priorities
- **Goal Tracking**: Progress visualization and milestone tracking

### AI-Powered Features
- **AI Transparency**: "Why This?" explanations for all recommendations with confidence scores, supporting factors, and alternatives
- **Personalized Onboarding**: LLM-generated questions based on user's financial profile
- **Contextual Recommendations**: Products and goals tailored to financial situation
- **Proactive Coaching**: Suggests next steps and creates action plans automatically

### Action Planning & Progress
- **Personalized Action Plans**: Structured plans with priority actions, monthly goals, and milestones
- **Progress Dashboard**: Overall readiness tracking with milestone timeline
- **Milestone Celebrations**: Achievement notifications with tiered rewards (bronze, silver, gold, platinum)

### Product Marketplace
- **Contextual Product Recommendations**: Mortgage products, savings accounts, credit cards, insurance
- **Product Filtering**: By category, eligibility, and priority
- **Real-time Account Linking**: Simulated indicators for connected accounts

### Coach Marketplace
- **Specialized Coaches**: Connect with domain experts:
  - **Zillow Coach**: Real estate search, property recommendations, neighborhood insights
  - **CarMax Coach**: Auto loan pre-approval, car search, financing options
  - **Credit Karma Coach**: Credit score analysis, credit card recommendations, credit building strategies
- **Consent Management**: Time-bound data sharing (24h, 3d, 7d) with granular permissions
- **Multi-Coach Chat**: Switch between Financial Coach and specialized coaches seamlessly
- **Smart Recommendations**: Financial Coach suggests relevant coaches based on conversation context
- **Rich Visualizations**: Credit Karma Coach provides interactive credit score dashboards with radial gauges, factor breakdowns, and progress tracking

### Data & Integration
- **Data Mesh**: Multi-account aggregation with real-time sync and account summary
- **Plaid Integration**: (Mocked) Bank account connection
- **Export/Share**: PDF, CSV, JSON export and shareable links for reports

### User Experience
- **Contextual Conversational UX**: Maintains conversation state, proactive suggestions, rich UI
- **Dark Theme**: Modern blue gradient design with animations
- **Visualizations**: Charts, gauges, progress bars, timelines
- **Gamification**: Badges, streaks, leaderboards, social proof
- **Settings Panel**: Notification preferences, user preferences, data & privacy

### Advanced Analytics
- **CLV Modeling**: Predictive Customer Lifetime Value projections
- **Success Stories & Peer Benchmarks**: Social proof and comparison data
- **Content Library**: Personalized financial education content
- **Rate Drop Alerts**: Proactive notifications for mortgage rate changes
- **Notification Center**: Centralized alerts and achievements
