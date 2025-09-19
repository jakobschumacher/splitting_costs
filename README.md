# Costsplitter2 - Fair Cost Division for Group Travel

A JavaScript web application for fairly splitting costs among group travel participants, handling complex scenarios like partial participation, age differences, and income adjustments.

## 🎯 Project Goal
Create a web-based version of the R package `costsplitter` that allows users to upload a CSV file with group travel expenses and automatically calculate fair cost distribution with minimal payment transactions.

## 🌟 Key Features
- **Complex Participation**: Handle partial participation (joining late/leaving early)
- **Age-Based Adjustments**: Different consumption rates for adults vs children
- **Income Fairness**: Optional "more" or "less" payment adjustments
- **Multiple Activities**: Support different cost categories (meals, tours, accommodation)
- **Smart Minimization**: Find optimal payment transactions to settle debts
- **Web Interface**: Easy CSV upload and visual results

## 📁 Input Format
Upload a CSV file with the following columns:

| Column | Description | Example Values |
|--------|-------------|----------------|
| `name` | Participant name (required) | "John Smith" |
| `group` | Optional grouping | "Smith Family" |
| `age` | Age or category | 25, "adult", "kid" |
| `cost_[activity]` | Share for activity | 1, 0.5, "full", "reduced" |
| `pay_[activity]` | Amount already paid | 150.00 |
| `adjustment` | Payment modifier | "more", "less", 1.2 |

### Example CSV:
```csv
name,group,age,cost_dinner,pay_dinner,cost_hotel,pay_hotel,adjustment
Alice Johnson,Johnson,adult,full,,full,300,
Bob Smith,Smith,12,reduced,,full,,less
Carol Davis,Davis,adult,full,80,full,,more
```

## 🚀 Quick Start

### Development Environment
```bash
resume
```

Or manually:
```bash
distrobox-enter js-Costsplitter2
```

### Rebuild Environment
```bash
curl -s https://raw.githubusercontent.com/jakobschumacher/distrobox_setup/main/bootstrap -o /tmp/bootstrap && bash /tmp/bootstrap
```

## 🏗️ Development Phases
1. **Phase 1**: CSV parsing and validation
2. **Phase 2**: Core calculation algorithms
3. **Phase 3**: Payment minimization
4. **Phase 4**: Web interface
5. **Phase 5**: Export features

## 📊 Algorithm Overview
1. **Validate** input data (required columns, data types)
2. **Transform** categorical values to numeric weights
3. **Calculate** cost per unit and individual obligations
4. **Minimize** number of payment transactions needed

## 🔗 Related Projects
- Original R package: `/home/jakob/Dokumente/03_Projekte/2024_10_08_Grouptraveller/costsplitter`
- See `claude.md` for detailed analysis and implementation notes

## 📋 Project Info
- **Type**: JavaScript Web Application
- **Container**: js-Costsplitter2
- **Created**: 2025-09-19
- **Based on**: R package costsplitter v0.5
