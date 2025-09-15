// src/webpages/mockUser.jsx
import ProfilePicPlaceholder from "@/assets/ProfilePicPlaceholder.svg";

export const mockUsers = [
  {
    id: 1,
    employeeId: "00001234",
    name: "Josh Can",
    position: "Benefits Assistant",
    role: "HR",
    location: "Metrobank Fort - Ecoprime Tower",
    email: "can.josh@metrobank.com.ph",
    contactNumber: "09123456789",
    birthDate: "2004-03-24",
    department: "Human Resources",
    profilePic: ProfilePicPlaceholder,
    username: "BA",
    password: "ba123",
  },
  {
    id: 2,
    employeeId: "00005678",
    name: "Maria Lopez",
    position: "Benefits Services Officer",
    role: "HR",
    location: "Metrobank Makati - Corporate Center",
    email: "lopez.maria@metrobank.com.ph",
    contactNumber: "09987654321",
    birthDate: "1998-08-15",
    department: "Human Resources",
    profilePic: ProfilePicPlaceholder,
    username: "BSO",
    password: "bso456",
  },
  {
    id: 3,
    employeeId: "00009876",
    name: "Carlos Reyes",
    position: "Division Head",
    role: "HR",
    location: "Metrobank Ortigas - HQ",
    email: "reyes.carlos@metrobank.com.ph",
    contactNumber: "09112223334",
    birthDate: "1985-12-02",
    department: "Human Resources",
    profilePic: ProfilePicPlaceholder,
    username: "DivisionHead",
    password: "div789",
  },
];

// Export individual users for convenience
export const mockUser = mockUsers[0]; // Default to Benefits Assistant
export default mockUsers;