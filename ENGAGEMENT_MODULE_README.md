# Engagement Module Documentation

## Overview

The Engagement Module provides a comprehensive solution for managing event engagements with complex date-time-timezone handling, validation, and user-friendly interfaces.

## Features Implemented

### 🔧 1. Engagement Table

- **Columns**: Engagement ID, Engagement Owner, Speaker, Caterer, Cohost, Primary Date & Time, Secondary Date & Time, Tertiary Date & Time, Created Date & Time
- **Functionality**:
  - Display all engagements in a responsive table format
  - Click on Engagement ID to view details on a separate route
  - Search functionality across all text fields
  - Sortable columns with visual indicators
  - Delete functionality with confirmation
  - Auto-incremented Engagement ID

### 🧾 2. Create Engagement Form

- **Form Fields**:
  - Engagement Owner (Required)
  - Speaker (Required)
  - Caterer (Required)
  - Cohost (Required)
  - Primary Date and Time (Required)
  - Secondary Date and Time (Optional)
  - Tertiary Date and Time (Optional)

### 📆 Date-Time Selection Logic

- **Date Picker**: Calendar component with minimum date validation
- **Time Dropdown**: 6:00 AM to 11:00 PM with 15-minute increments
- **Timezone Dropdown**: 10 supported timezones (ET, CT, MT, PT, IST, GMT, UTC, CET, JST, AEST)

### 🌐 Timezone Handling

- **Slot Management**: Selected time slots are disabled across all date pickers
- **Buffer System**: 30-minute buffer before and after selected slots
- **Duplicate Prevention**: No duplicate date-time-timezone combinations allowed
- **Dynamic Updates**: Timezone changes update all related slots

### ❌ Deletion Handling

- Users can remove selected Date-Time cards (secondary/tertiary)
- Related time slots are released/unlocked after deletion
- Visual feedback with confirmation dialogs

### ✅ Validation

- All text fields are required
- Primary Date and Time is mandatory
- Secondary and Tertiary are optional
- All selected slots must be unique
- Real-time validation with error messages

### 📋 4. After Successful Submission

- Engagement is saved to the database
- Created Date and Time is automatically captured
- Form closes and table refreshes
- Success feedback to user

### 👁️ 5. View Engagement

- Clicking on Engagement ID routes to a dedicated view page
- All fields displayed in read-only, formatted style
- Color-coded sections for different information types
- Responsive design with modern UI

## Technical Implementation

### Dependencies Added

```json
{
  "react-datepicker": "^4.25.0",
  "@types/react-datepicker": "^4.19.4",
  "luxon": "^3.4.4",
  "@types/luxon": "^3.3.5"
}
```

### File Structure

```
src/
├── components/
│   └── dateTimePicker.tsx          # Custom date-time-timezone picker
├── modules/engagement/
│   ├── engagementType.ts           # TypeScript interfaces and constants
│   ├── engagementForm.tsx          # Create engagement form
│   ├── engagementTable.tsx         # Engagement listing table
│   └── engagementView.tsx          # Engagement details view
└── router/
    └── router.tsx                  # Updated with engagement routes
```

### Key Components

#### DateTimePicker Component

- Handles complex date-time-timezone selection
- Implements slot validation and buffering
- Provides real-time feedback
- Supports disabled slots management

#### EngagementForm Component

- Comprehensive form validation
- Dynamic slot management
- Error handling and user feedback
- Modal-based interface

#### EngagementTable Component

- Responsive table design
- Search and sort functionality
- Action menus for each engagement
- Navigation to detail views

#### EngagementView Component

- Read-only detail display
- Color-coded information sections
- Responsive layout
- Navigation back to list

## API Endpoints

### JSON Server (Port 3000)

- `GET /engagements` - List all engagements
- `POST /engagements` - Create new engagement
- `GET /engagements/:id` - Get specific engagement
- `DELETE /engagements/:id` - Delete engagement

### Data Structure

```typescript
interface Engagement {
  id: number;
  engagementOwner: string;
  speaker: string;
  caterer: string;
  cohost: string;
  primaryDateTime: DateTimeSlot;
  secondaryDateTime?: DateTimeSlot;
  tertiaryDateTime?: DateTimeSlot;
  createdDateTime: string;
}

interface DateTimeSlot {
  date: string;
  time: string;
  timezone: string;
}
```

## Usage Instructions

### Creating an Engagement

1. Navigate to the Engagements page
2. Click "Create Engagement" button
3. Fill in all required fields
4. Select primary date and time (required)
5. Optionally add secondary and tertiary date-times
6. Submit the form

### Viewing Engagement Details

1. Click on any Engagement ID in the table
2. View all details in a formatted, read-only interface
3. Use the "Back to Engagements" button to return

### Managing Engagements

- Use the search bar to filter engagements
- Click column headers to sort
- Use the action menu (⋮) for additional options
- Delete engagements with confirmation

## Features Highlights

### Advanced Date-Time Logic

- **Slot Validation**: Prevents double-booking of time slots
- **Buffer System**: 30-minute buffer prevents scheduling conflicts
- **Timezone Support**: Handles multiple timezones with proper conversion
- **Dynamic Updates**: Real-time slot availability updates

### User Experience

- **Responsive Design**: Works on all screen sizes
- **Visual Feedback**: Color-coded sections and status indicators
- **Error Handling**: Comprehensive validation with helpful messages
- **Loading States**: Proper loading indicators and error states

### Data Integrity

- **Validation**: Client-side and server-side validation
- **Consistency**: Ensures data consistency across all operations
- **Audit Trail**: Automatic timestamp tracking
- **Unique Constraints**: Prevents duplicate entries

## Browser Compatibility

- Modern browsers with ES6+ support
- React 19.1.1
- TypeScript 5.7.2
- Tailwind CSS 3.4.17

## Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Start JSON server: `npx json-server --watch db.json --port 3000`
4. Access the application at `http://localhost:5173`

## Future Enhancements

- Edit functionality for existing engagements
- Bulk operations (import/export)
- Advanced filtering and reporting
- Calendar view integration
- Email notifications for scheduling conflicts
- Multi-language support
