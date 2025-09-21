# Costsplitter - Fair Cost Division for Group Travel

A modern JavaScript web application for fairly splitting costs among group travel participants. Upload your expense CSV file and get instant payment calculations with a clean, intuitive interface supporting multiple languages.

## 🎯 Project Goal
A web-based cost splitting application that calculates fair payment distributions and minimizes the number of transactions needed to settle group expenses.

## 🌟 Key Features
- **💰 Smart Payment Calculation**: Automatically calculates who owes what to whom
- **📱 Modern Web Interface**: Clean, responsive design with step-by-step process
- **🌍 Multi-Language Support**: Full internationalization (English/German)
- **⚙️ Flexible Options**: Individual vs Group payment modes, amount rounding
- **📊 Visual Results**: Payment matrix, activity breakdown, and summary cards
- **📄 PDF Export**: Download comprehensive payment reports
- **🔒 Client-Side Processing**: All calculations done locally, no data sent to servers

## 📁 CSV Input Format
Upload a CSV file with these columns:

| Column | Description | Example Values |
|--------|-------------|----------------|
| `name` | Participant name (required) | "Alice", "Bob Smith" |
| `group` | Optional grouping | "Smith Family", "Team A" |
| `pay_[activity]` | Amount paid for activity | 100, 50.75, 0 |
| `cost_[activity]` | Participation level | "full", "half", 0.5, 1.2 |
| `age` | Age or category (optional) | 25, "adult", "kid" |
| `adjustment` | Payment modifier (optional) | "more", "less", 1.2 |

### Example CSV:
```csv
name,group,pay_dinner,cost_dinner,age
Alice Johnson,Johnson Family,100,full,adult
Bob Smith,Smith Family,50,0.5,12
Carol Davis,Davis Family,0,full,adult
```

## 🚀 Quick Start

### 🌐 Online Demo
Try the application instantly: **[https://jakobschumacher.github.io/splitting_costs/](https://jakobschumacher.github.io/splitting_costs/)**

### 🎮 How to Use
1. **Configure Options**: Choose payment mode (Individual/Group) and rounding preferences
2. **Upload CSV**: Drop your expense file or click to browse
3. **View Results**: See payment instructions, matrix overview, and activity breakdown
4. **Download Report**: Get a PDF summary of all calculations

### 💻 Local Development
```bash
# Clone and install
git clone [repository-url]
cd costsplitter
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 📊 Test Data
The `testdata/` directory contains various CSV examples:
- `simple_dinner.csv` - Basic 4-person dinner split
- `family_vacation.csv` - Multi-generational family trip
- `business_trip.csv` - Corporate travel expenses
- `large_group.csv` - 15-person group scenario
- `minimal_example.csv` - Simplest possible format
- See `testdata/README.md` for complete list and descriptions

## 🔧 Technical Features
- **Frontend**: Vanilla JavaScript with ES6 modules
- **Styling**: Custom CSS with responsive design
- **Internationalization**: Multi-language support (EN/DE)
- **Testing**: Comprehensive Jest test suite (130+ tests)
- **PDF Generation**: Client-side report creation
- **File Processing**: CSV parsing with validation and security checks

## 🔗 Related Projects
- Original R package: `/home/jakob/Dokumente/03_Projekte/2024_10_08_Grouptraveller/costsplitter`
- See `claude.md` for detailed analysis and implementation notes

## 🚀 Deployment
This application is automatically deployed to GitHub Pages using GitHub Actions. When you push to the main branch:

1. **Tests** are run to ensure code quality
2. **Build** creates an optimized production bundle
3. **Deploy** uploads to GitHub Pages

### Manual Deployment
```bash
npm run build  # Build for production
# Commit and push to trigger deployment
```

## 📋 Project Info
- **Type**: Modern JavaScript Web Application
- **Framework**: Vanilla JS with ES6 modules
- **UI**: Responsive CSS with step-by-step interface
- **Languages**: English, German (i18n support)
- **Testing**: Jest with 130+ comprehensive tests
- **Created**: 2025-09-19
- **Based on**: R package costsplitter concepts with modern web implementation
