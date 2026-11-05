# 🚀 Quick Implementation Reference

## Files You Need to Know About

### 🔧 Core Service (NEW)
**Location:** `src/services/AccessControl.js`

**What it does:** Controls everything about user access
```javascript
// Check if user can access Purchase
canAccessFeature('purchase', user)  // true/false

// Get the right API endpoint
getAPIEndpoint(country)  // Returns Togo or DRC API

// Get available countries for user
getAvailableCountries(user)  // Returns filtered countries

// Initialize on app load
initializeAccessControl()  // Sets up localStorage
```

---

### ⚙️ Configuration (UPDATED)
**Location:** `src/config.js`

**What changed:** `baseURL_` is now dynamic
```javascript
// BEFORE: Always DRC API
export const baseURL_ = 'https://minexxapi-drc-...'

// AFTER: Switches based on user
export const baseURL_ = getBaseURL();
// Togo users → Togo API
// Everyone else → DRC API
```

---

### 🗺️ Header Navigation (UPDATED)
**Location:** `src/jsx/layouts/nav/Header.js`

**What changed:** Uses AccessControl instead of local logic
```javascript
// Now imports from AccessControl
import { getAvailableCountriesFromAC, getAccessLevel, ... } from AccessControl

// Result: 
// - Togo users see only Togo
// - Multi-country users see Rwanda/DRC
// - All features work seamlessly
```

---

### 📦 New Feature: Purchase (COPIED)
**Location:** `src/jsx/pages/Purchase.js`

**Who can see it:** Only Gold-Togo users
**URL:** `/purchase`
**Status:** Only rendered if user has permission

---

### 🛣️ Routing (UPDATED)
**Location:** `src/jsx/index.js`

**What changed:** Purchase route is conditional
```javascript
// Purchase route only added if user has access
...(canAccessFeature('purchase', user) ? [{
  url: 'purchase', 
  component: <Purchase/>
}] : [])

// Result:
// - Gold-Togo: Route available ✓
// - Others: Route doesn't exist ✓
```

---

### 🚀 App Initialization (UPDATED)
**Location:** `src/App.js`

**What changed:** Initialize AccessControl on app load
```javascript
useEffect(() => {
  checkAutoLogin(dispatch, navigate);
  initializeAccessControl();  // NEW LINE
}, []);

// Result:
// - User logs in
// - Access control set up automatically
// - Correct country, API, features loaded
```

---

## How to Test

### Test #1: Gold-Togo User
```bash
1. Open browser dev tools (F12)
2. Go to Application → Storage → Clear All
3. Login with: email="info@minexx.co", access="Gold-Togo"
4. Check:
   - Header shows "Togo"
   - Try /purchase → should work
   - Try /reports → should work
   - localStorage._country = "Togo"
   - localStorage._dash = "gold"
```

### Test #2: Regular User  
```bash
1. Clear storage again
2. Login with regular user
3. Check:
   - Header shows "Rwanda" or "DRC"
   - Try /purchase → should be 404
   - Can switch countries
   - localStorage._country = "Rwanda" (default)
```

### Test #3: API Endpoints
```bash
1. Open network tab (F12 → Network)
2. Navigate to any page
3. Look for API calls:
   - Togo user: Should call Togo API
   - Regular user: Should call DRC API
```

---

## Key Functions Quick Reference

### AccessControl.js API

```javascript
// ✅ USE THESE FUNCTIONS

hasGoldTogoAccess(user)
// Purpose: Check if user is Gold-Togo
// Returns: true/false
// Example: if (hasGoldTogoAccess(user)) { ... }

getInitialCountry(user)
// Purpose: Get user's default country
// Returns: "Rwanda", "DRC", "Togo", etc.
// Example: const country = getInitialCountry(user)

getAvailableCountries(user)
// Purpose: Get countries user can access
// Returns: { Rwanda: url, DRC: url }
// Example: const countries = getAvailableCountries(user)

getAccessLevel(country, user)
// Purpose: Get dashboard mode for country
// Returns: "3ts", "gold", or "both"
// Example: const mode = getAccessLevel("Togo", user)

getCountryDefaultLanguage(country)
// Purpose: Get language for country
// Returns: "en" or "fr"
// Example: const lang = getCountryDefaultLanguage("DRC")

canAccessFeature(feature, user)
// Purpose: Check if user can access feature
// Returns: true/false
// Example: if (canAccessFeature('purchase', user)) { ... }

getAPIEndpoint(country)
// Purpose: Get API URL for country
// Returns: full URL to API
// Example: const api = getAPIEndpoint("Togo")

initializeAccessControl()
// Purpose: Set up access control on app load
// Returns: undefined
// Example: initializeAccessControl()
```

---

## Common Issues & Solutions

### ❌ Import Error
```
Error: Cannot find module AccessControl.js
```
**Solution:** Make sure file exists at `src/services/AccessControl.js`

---

### ❌ Purchase Route 404
```
Navigating to /purchase returns 404
```
**Solution:** User doesn't have Gold-Togo access. Check:
1. `user.access === 'Gold-Togo'`
2. `user.email === 'info@minexx.co' || 'beda@minexx.email'`

---

### ❌ Wrong API Called
```
User sees DRC data but is Gold-Togo user
```
**Solution:** Check localStorage._country
1. Open Dev Tools → Application → Storage
2. Find `_country` key
3. Should be "Togo" for Gold-Togo users

---

### ❌ Country Selector Wrong
```
Gold-Togo user can switch to other countries
```
**Solution:** This should NOT happen. Contact support if occurs.

---

## Environment Variables (Optional)

If you want to move URLs to `.env`:

```bash
# .env
REACT_APP_API_DRC=https://minexxapi-drc-p7n5ing2cq-uc.a.run.app/
REACT_APP_API_TOGO=https://minexxapi-togo-clone-p7n5ing2cq-uc.a.run.app/
```

Then update `AccessControl.js`:
```javascript
const API_ENDPOINTS = {
  DRC: process.env.REACT_APP_API_DRC,
  Togo: process.env.REACT_APP_API_TOGO,
};
```

---

## Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Both APIs accessible
- [ ] Gold-Togo user can access Purchase
- [ ] Regular users cannot access Purchase
- [ ] Language switching works
- [ ] Country switching works (for applicable users)
- [ ] Page refresh preserves access
- [ ] No breaking changes in other features

---

## Questions?

See full documentation:
- 📖 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Complete details
- 📄 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Overview
- 💻 [src/services/AccessControl.js](./src/services/AccessControl.js) - Code reference

---

**This is Option 1: Unified Single-Codebase ✅ COMPLETE**

You now have one Minexx folder that handles both DRC and Togo users seamlessly! 🚀
