# Profile Picture - Remove Button & Success Modals Implementation

## ✅ Backend Complete

### API Endpoint Created:
- **DELETE** `/api/users/:id/profile-picture`
- **Controller:** `Backend/controllers/userController.js` - `removeProfilePicture()` (lines 946-1017)
- **Route:** `Backend/routes/userRoutes.js` (lines 240-246)
- **Frontend Service:** `Frontend/src/services/api.js` - `removeProfilePicture()` (lines 512-524)

### What it does:
1. Sets `profile_picture = NULL` in database
2. Deletes physical file from `/uploads/profile-pictures/`
3. Logs activity with action `REMOVE_PROFILE_PICTURE`
4. Returns `{ success: true, data: { profile_picture: null } }`

---

## 🔄 Frontend TODO - Apply to ALL Profile Pages

### Files to Update:
1. ✅ `ExecutiveEmployeeProfile.jsx`
2. ✅ `HR_Profile.jsx` (HR, Benefits Officer, Welfare Head)
3. ✅ `AdminProfilePage.jsx`

### Changes Needed for Each Profile Page:

#### 1. Import AlertModal
```javascript
import AlertModal from '@/Components/AlertModal';
```

#### 2. Add State for Modals
```javascript
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [isRemoving, setIsRemoving] = useState(false);
```

#### 3. Add Remove Handler
```javascript
const handleRemoveProfilePicture = async () => {
  if (!window.confirm('Are you sure you want to remove your profile picture?')) {
    return;
  }

  try {
    setIsRemoving(true);
    const response = await apiService.removeProfilePicture(profile.id);

    if (response.success) {
      setProfile(prev => ({
        ...prev,
        profile_picture: null
      }));
      setSuccessMessage('Profile picture removed successfully!');
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error('Error removing profile picture:', error);
    alert('Failed to remove profile picture. Please try again.');
  } finally {
    setIsRemoving(false);
  }
};
```

#### 4. Update Upload Handler to Show Success Modal
```javascript
const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const response = await apiService.uploadProfilePicture(profile.id, file);
      if (response.success) {
        setProfile(prev => ({
          ...prev,
          profile_picture: response.data.profile_picture
        }));
        setSuccessMessage('Profile picture updated successfully!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  }
};
```

#### 5. Update JSX - Add Remove Button
```jsx
{/* BEFORE */}
<button
  onClick={() => document.getElementById("profileImageInput").click()}
  className="mt-3 flex items-center gap-2 text-blue-600 hover:underline text-xs sm:text-sm font-medium transition-colors"
>
  <img src={CameraIcon} alt="camera" className="w-4 h-4 sm:w-5 sm:h-5" />
  Change Picture
</button>

{/* AFTER */}
<div className="mt-3 flex flex-col sm:flex-row gap-2">
  <button
    onClick={() => document.getElementById("profileImageInput").click()}
    className="flex items-center gap-2 text-blue-600 hover:underline text-xs sm:text-sm font-medium transition-colors"
  >
    <img src={CameraIcon} alt="camera" className="w-4 h-4 sm:w-5 sm:h-5" />
    Change Picture
  </button>

  {profile.profile_picture && (
    <button
      onClick={handleRemoveProfilePicture}
      disabled={isRemoving}
      className="flex items-center gap-2 text-red-600 hover:underline text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
    >
      <X className="w-4 h-4 sm:w-5 sm:h-5" />
      {isRemoving ? 'Removing...' : 'Remove Picture'}
    </button>
  )}
</div>
```

#### 6. Add Alert Modal Component
```jsx
{/* Add at end of component before closing div */}
<AlertModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Success"
  message={successMessage}
  type="success"
  confirmText="OK"
/>
```

#### 7. Import X icon
```javascript
import { X } from 'lucide-react';
```

---

## 🔄 Dashboard Updates TODO

### Files to Update:
1. `HRDashboard.jsx` (lines 375-383, 575-580)
2. `ExecutiveEmployeeDashboard.jsx` (lines 455-460)

### Changes Needed:

#### Current Code (Both Dashboards):
```jsx
{user && user.profilePic ? (
  <img
    src={user.profilePic}
    alt={`${getUserDisplayName(user)} profile`}
    className="w-7 h-7 rounded-full object-cover border border-white"
  />
) : (
  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
    {getUserInitials(user)}
  </div>
)}
```

#### Updated Code:
```jsx
import ProfileGray from '@/assets/profilegray.svg';

// Add helper function
const getProfilePictureUrl = (picturePath) => {
  if (!picturePath) return null;
  if (picturePath.startsWith('http')) return picturePath;
  if (picturePath.startsWith('data:')) return picturePath;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${picturePath}`;
};

// Update JSX
{user?.profile_picture || user?.profilePic ? (
  <img
    src={getProfilePictureUrl(user.profile_picture || user.profilePic) || ProfileGray}
    alt={`${getUserDisplayName(user)} profile`}
    className="w-7 h-7 rounded-full object-cover border border-white"
  />
) : (
  <img
    src={ProfileGray}
    alt="Default profile"
    className="w-7 h-7 rounded-full object-cover border border-white"
  />
)}
```

---

## Implementation Checklist

### ✅ Backend:
- [x] Create `removeProfilePicture` function in userController
- [x] Add route `DELETE /:id/profile-picture`
- [x] Add `removeProfilePicture` to apiService
- [x] Export `removeProfilePicture` from service

### 🔄 Frontend Profile Pages:
- [ ] ExecutiveEmployeeProfile.jsx - Add Remove button + Success modals
- [ ] HR_Profile.jsx - Add Remove button + Success modals
- [ ] AdminProfilePage.jsx - Add Remove button + Success modals

### 🔄 Frontend Dashboards:
- [ ] HRDashboard.jsx - Fix profile picture display (2 locations)
- [ ] ExecutiveEmployeeDashboard.jsx - Fix profile picture display (1 location)

---

## Testing Checklist

### Upload:
- [ ] Upload picture → Shows success modal
- [ ] Modal shows "Profile picture updated successfully!"
- [ ] Picture displays immediately
- [ ] Picture persists after refresh

### Remove:
- [ ] Remove button only shows if picture exists
- [ ] Click Remove → Shows confirmation
- [ ] Confirm → Shows success modal
- [ ] Modal shows "Profile picture removed successfully!"
- [ ] Displays ProfileGray default icon
- [ ] Persists after refresh

### Dashboards:
- [ ] Profile picture shows in HRDashboard
- [ ] Profile picture shows in ExecutiveEmployeeDashboard
- [ ] Falls back to ProfileGray if no picture
- [ ] Updates when picture is changed

---

## Summary

**Backend:** ✅ Complete
**Frontend:** 🔄 Needs implementation on 5 files

All the backend infrastructure is ready. Just need to update the 3 profile pages and 2 dashboards with the UI changes above.
