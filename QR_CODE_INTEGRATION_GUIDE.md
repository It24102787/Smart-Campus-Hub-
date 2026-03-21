# Study Spot Finder - QR Code Integration Guide

## ✅ What's Been Updated

### 1. **StudySpotsPage.jsx** (Main page component)
   - ✓ Added `Smartphone` icon import from lucide-react
   - ✓ Imported QR code image: `import campusMapQR from '../../assets/images/campus-map-qr.png'`
   - ✓ Added `showQRModal` state to manage QR modal visibility
   - ✓ Restructured "Browse" tab layout using grid: filters+rooms on left, QR section on right (responsive)
   - ✓ Added blue "Scan QR Code" card with:
     - Smartphone icon and title
     - Clickable QR image (32x32 rem / small preview)
     - Label: "Scan to view campus map"
     - "View Full QR" button
   - ✓ Added full-screen QR Code Modal with:
     - Large 64x64 rem QR image display
     - Instructions text
     - Close button

### 2. **QRCodeModal.jsx** (NEW - Optional helper component)
   - Reusable modal component for displaying the QR code
   - Can be used: `<QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} qrImage={campusMapQR} />`

## 📁 Next Steps: Add Your QR Code Image

### Step 1: Prepare Your QR Image
Ensure your QR code image is in one of these formats:
- PNG (recommended - transparent background)
- JPG/JPEG
- SVG (if vector format is available)

### Step 2: Add the Image File
Place your QR code image at:
```
frontend/src/assets/images/campus-map-qr.png
```

The file MUST be named `campus-map-qr.png` (or update the import if using a different name).

Directory structure:
```
frontend/
├── src/
│   ├── assets/
│   │   └── images/
│   │       ├── auth-bg.svg (existing)
│   │       └── campus-map-qr.png (NEW - add your QR here)
│   └── pages/
│       └── study-spots/
│           └── StudySpotsPage.jsx (updated)
```

### Step 3: Verify the Setup
After adding the image, the page should:
1. Display a blue "Scan QR Code" card on the right (on desktop)
2. Show a small preview of the QR code
3. Allow clicking the image or "View Full QR" button to open the modal
4. Display the full QR code in a modal on desktop and mobile

## 🎨 UI/UX Features Implemented

### Desktop Layout
```
┌─────────────────────────────────────────┐
│     Summary Cards (4 columns)           │
└─────────────────────────────────────────┘
┌──────────────────────────┐  ┌──────────┐
│   Filters + Room Cards   │  │ QR Code  │
│   (2-3 columns)          │  │ Section  │
│                          │  │          │
│                          │  └──────────┘
└──────────────────────────┘
```

### Mobile Layout
```
┌──────────────┐
│Summary Cards │
├──────────────┤
│   Filters    │
├──────────────┤
│  Room Cards  │
│  (1 column)  │
├──────────────┤
│  QR Section  │
│  (Full width)│
└──────────────┘
```

## 🎯 Feature Details

### QR Code Card
- **Location**: Right sidebar (desktop) / After rooms (mobile)
- **Background**: Blue-tinted (bg-blue-50, border-blue-200)
- **Preview Size**: 32x32 rem (128px × 128px)
- **Full Size Modal**: 64x64 rem (256px × 256px)
- **Interaction**: Click image or "View Full QR" button to open modal

### QR Code Modal
- **Full-screen overlay** with centered card
- **Large display** for easy scanning
- **Instructions**: "Use your phone camera to scan this QR code and access the campus map"
- **Close button**: X icon + close button
- **Responsive**: Adapts to mobile and tablet screens

## 🛠️ Code Changes Summary

### Import Statements
```jsx
// Added to imports
import { Smartphone } from 'lucide-react';
import campusMapQR from '../../assets/images/campus-map-qr.png';
```

### State Management
```jsx
const [showQRModal, setShowQRModal] = useState(false);
```

### Layout Grid Structure
```jsx
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div className="lg:col-span-2">
    {/* Filters and Room Cards */}
  </div>
  <div>
    {/* QR Code Section */}
  </div>
</div>
```

### Styling Classes Used
- Container: `rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm`
- Image: `w-32 h-32 object-contain` (preview)
- Image (modal): `w-64 h-64 object-contain` (full)
- Button: `rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100`

## ✨ Optional Enhancements

If you want to use the reusable `QRCodeModal` component instead of inline code:

1. Import the component in StudySpotsPage.jsx:
```jsx
import QRCodeModal from '../../components/study-spots/QRCodeModal';
```

2. Replace the modal JSX with:
```jsx
<QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} qrImage={campusMapQR} />
```

This keeps the page component cleaner and makes the modal reusable if needed elsewhere.

## 📝 File Structure After Update

```
frontend/src/
├── assets/
│   └── images/
│       ├── auth-bg.svg
│       └── campus-map-qr.png ← ADD YOUR QR HERE
├── components/
│   └── study-spots/
│       └── QRCodeModal.jsx ← NEW (optional)
└── pages/
    └── study-spots/
        └── StudySpotsPage.jsx ← UPDATED
```

## 🚀 Testing

After adding your QR image:

1. **Frontend test**: Run `npm run dev` and navigate to the Study Spots page
2. **Desktop**: QR card should appear on the right
3. **Mobile**: QR card should appear below rooms
4. **Clicking QR image or button**: Should open the modal
5. **Modal close**: Click X or "Close" button to dismiss

## 🔄 Swapping QR Images Later

To swap the QR code image in the future:
1. Replace the file at `frontend/src/assets/images/campus-map-qr.png`
2. No code changes needed - imports are already configured

## ❓ Troubleshooting

### QR image not showing
- [ ] Check file exists: `frontend/src/assets/images/campus-map-qr.png`
- [ ] Verify filename matches import: `campus-map-qr.png`
- [ ] Check browser console for import errors
- [ ] Clear build cache: `rm -rf frontend/dist` and rebuild

### Image is blurry or pixelated
- [ ] Ensure original QR image is high resolution (at least 512x512px)
- [ ] Use PNG format for best quality
- [ ] Adjust size classes if needed: Change `w-32 h-32` or `w-64 h-64`

### Layout looks broken on mobile
- [ ] Clear browser cache
- [ ] Check that Tailwind grid classes are working
- [ ] Verify responsive breakpoints (lg: is 1024px in Tailwind)

---

**Status**: ✅ Ready for QR image integration
**Next Action**: Add your `campus-map-qr.png` image file to `frontend/src/assets/images/`
