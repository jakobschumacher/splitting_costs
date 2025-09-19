# Test Data Files

This directory contains various CSV test files to demonstrate and test the cost splitting application.

## Test Files Overview

### Simple Examples
- **`simple_dinner.csv`** - Basic 4-person dinner split with groups
- **`minimal_example.csv`** - Minimal required columns only
- **`edge_cases.csv`** - Tests edge cases and error handling

### Real-World Scenarios
- **`group_travel.csv`** - Multi-activity trip with families
- **`weekend_trip.csv`** - Friends weekend getaway
- **`family_vacation.csv`** - Multi-generational family trip
- **`business_trip.csv`** - Corporate travel expenses
- **`college_friends.csv`** - Student budget scenario
- **`skiing_trip.csv`** - Winter sports trip with equipment

### Complex Examples
- **`large_group.csv`** - 15-person group with multiple teams
- **`familyreunion.csv`** - Large family reunion (31 people, multiple days)
- **`complexexample.csv`** - Mixed age groups and adjustments

## Testing Different Features

### Column Types Tested
- **Names**: Required participant names
- **Groups**: Family/team groupings
- **Ages**: Adult/kid/numeric ages
- **Costs**: full/reduced/half/numeric/percentage values
- **Payments**: Numeric payment amounts
- **Adjustments**: more/less/numeric multipliers

### Scenarios Covered
- Individual vs group payment modes
- Multiple activities per trip
- Different cost sharing ratios
- Age-based cost adjustments
- Empty/missing values
- Special characters and edge cases
- Large groups (15+ people)
- Multi-day events

## Usage
1. Upload any CSV file through the web interface
2. Select individual or group payment mode
3. Review calculated payment instructions
4. Test different scenarios to understand the algorithm

## File Formats
All files use standard CSV format with:
- First row as headers
- Comma-separated values
- UTF-8 encoding
- Standard cost/payment column naming conventions