# StudySpotsPage.jsx - Updated Code Reference

## Key Code Sections

### 1. Import Statements (Top of file)
```jsx
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Search, Thermometer, Users, X, Smartphone } from 'lucide-react';
import { studySpotApi } from '../../api/studySpotApi';
import campusMapQR from '../../assets/images/campus-map-qr.png';
```

### 2. State for QR Modal (Around line 41)
```jsx
const [showQRModal, setShowQRModal] = useState(false);
```

### 3. QR Code Card Section (Updated Browse Tab)
```jsx
<div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
  <div className="flex items-center gap-2 mb-3">
    <Smartphone className="text-blue-700" size={20} />
    <h3 className="text-lg font-bold text-blue-900">Scan QR Code</h3>
  </div>
  <p className="text-xs text-blue-700 mb-4">Access the campus map with a quick scan</p>

  <div className="flex justify-center mb-4">
    <div className="rounded-xl border-2 border-blue-200 bg-white p-3 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowQRModal(true)}>
      <img
        src={campusMapQR}
        alt="Campus map QR code"
        className="w-32 h-32 object-contain"
      />
    </div>
  </div>

  <p className="text-center text-xs text-blue-600 mb-4 px-2">
    Scan to view campus map
  </p>

  <button
    onClick={() => setShowQRModal(true)}
    className="w-full rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
  >
    View Full QR
  </button>
</div>
```

### 4. QR Code Modal (End of component, before closing tag)
```jsx
{showQRModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campus Map QR Code</h2>
          <p className="text-sm text-slate-500">Scan with your phone camera</p>
        </div>
        <button onClick={() => setShowQRModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <div className="rounded-xl bg-white p-4 border border-slate-200">
          <img
            src={campusMapQR}
            alt="Campus map QR code"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>

      <p className="text-center text-sm text-slate-600 mb-4">
        Use your phone camera to scan this QR code and access the campus map
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowQRModal(false)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
```

### 5. Layout Structure (Browse Tab Content)
The browse section now uses a 3-column grid layout:
```jsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div className="lg:col-span-2 space-y-4">
    {/* Filters */}
    {/* Room Cards */}
  </div>

  {/* QR Code Section - Takes 1 column on desktop, full width on mobile */}
  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
    {/* QR Card Content */}
  </div>
</div>
```

## Breakpoints
- **Mobile**: `grid-cols-1` (full width)
- **Desktop (1024px+)**: `lg:grid-cols-3` (QR takes 1 column, content takes 2)

## Colors & Styling
- **Card Background**: `bg-blue-50` with `border-blue-200`
- **Icon Color**: `text-blue-700`
- **Text Colors**: `text-blue-900` (title), `text-blue-700` (description), `text-blue-600` (label)
- **Button**: White background with blue text, hover to light blue
- **Modal Overlay**: `bg-slate-900/60` (60% opacity)

## Interactive Elements
- QR image is clickable: `cursor-pointer hover:shadow-lg`
- "View Full QR" button opens modal
- Close button (X icon) and "Close" button both close modal
- Smooth transitions throughout

## Responsive Design
- **Mobile (< 1024px)**: QR section appears below room cards, full width
- **Desktop (≥ 1024px)**: QR section appears as right sidebar (1/3 width)
- **Filters**: Responsive grid (1 column on mobile, 4 columns on desktop)

## File Locations
- **Component Updated**: `frontend/src/pages/study-spots/StudySpotsPage.jsx`
- **QR Image Location**: `frontend/src/assets/images/campus-map-qr.png` (add your image here)
- **Optional Modal Component**: `frontend/src/components/study-spots/QRCodeModal.jsx`
