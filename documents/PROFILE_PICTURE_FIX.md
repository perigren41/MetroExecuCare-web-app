# Profile Picture Display Issue - Root Cause & Fix

**Date:** January 9, 2025
**Status:** 🔴 CRITICAL BUG

---

## Problem

Profile picture uploads successfully to backend but does NOT display in the frontend Profile page "Basic Information" section.

---

## Root Cause Analysis

### Issue #1: API Response Mismatch
**Backend returns:**
```json
{
  "success": true,
  "data": {
    "profile_picture_url": "/uploads/profile-pictures/filename.jpg"
  }
}
```

**Frontend expects:**
```javascript
setProfile({ ...profile, profile_picture: response.data.profile_picture });
```

**Problem:** Backend returns `profile_picture_url` but frontend reads `profile_picture`

---

### Issue #2: Relative Path vs Full URL
**Database stores:** `/uploads/profile-pictures/filename.jpg`

**Frontend needs:** `http://localhost:5000/uploads/profile-pictures/filename.jpg`

**Current code:**
```jsx
<img src={profile.profile_picture || ProfileGray} />
```

This will try to load: `/uploads/profile-pictures/filename.jpg` from the **frontend server** (port 5173), not the backend (port 5000).

---

### Issue #3: Profile Not Refreshing After Upload
After upload, the profile state updates but the component doesn't re-fetch from the API, so when you refresh the page, the old data loads.

---

## Solutions

### Fix #1: Update Backend Response
**File:** `Backend/controllers/userController.js` (Line 920-926)

**Change:**
```javascript
res.json({
  success: true,
  message: 'Profile picture updated successfully',
  data: {
    profile_picture_url: profilePictureUrl  // ❌ Wrong key
  }
});
```

**To:**
```javascript
res.json({
  success: true,
  message: 'Profile picture updated successfully',
  data: {
    profile_picture: profilePictureUrl  // ✅ Correct key
  }
});
```

---

### Fix #2: Use Full URL in Frontend
**File:** `Frontend/src/webpages/ExecutiveEmployeeProfile.jsx` (Line 121)

**Add helper function:**
```javascript
const getProfilePictureUrl = (picturePath) => {
  if (!picturePath) return ProfileGray;
  if (picturePath.startsWith('http')) return picturePath;
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${picturePath}`;
};
```

**Change:**
```jsx
<img
  src={profile.profile_picture || ProfileGray}
  alt="Profile"
  className="w-full h-full object-cover"
/>
```

**To:**
```jsx
<img
  src={getProfilePictureUrl(profile.profile_picture)}
  alt="Profile"
  className="w-full h-full object-cover"
/>
```

---

### Fix #3: Refetch Profile After Upload
**File:** `Frontend/src/webpages/ExecutiveEmployeeProfile.jsx` (Line 86-90)

**Change:**
```javascript
const response = await apiService.uploadProfilePicture(profile.id, file);
if (response.success) {
  // Update the profile with the new image URL
  setProfile({ ...profile, profile_picture: response.data.profile_picture });
}
```

**To:**
```javascript
const response = await apiService.uploadProfilePicture(profile.id, file);
if (response.success) {
  // Refetch the entire profile to ensure data consistency
  const profileResponse = await apiService.getProfile();
  if (profileResponse.success) {
    setProfile(profileResponse.data);
  }
}
```

---

## Testing Steps

1. ✅ Upload profile picture
2. ✅ Verify image displays immediately after upload
3. ✅ Refresh page
4. ✅ Verify image still displays after refresh
5. ✅ Check browser Network tab - should load from `localhost:5000/uploads/...`
6. ✅ Test with all roles (Executive, HR, Benefits, Welfare, Admin)

---

## Expected Behavior After Fix

1. User uploads profile picture
2. Backend saves to `/uploads/profile-pictures/`
3. Backend returns `profile_picture: "/uploads/profile-pictures/..."`
4. Frontend converts to full URL: `http://localhost:5000/uploads/profile-pictures/...`
5. Image displays immediately
6. Profile data refetches to get latest DB value
7. Page refresh shows the uploaded image

---

**Priority:** CRITICAL - User-facing bug affecting all roles
