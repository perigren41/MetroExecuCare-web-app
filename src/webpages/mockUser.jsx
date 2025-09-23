// src/webpages/mockUser.jsx

export const mockUsers = [
  {
    id: 1,
    employee_id: "00001234",
    first_name: "FirstName",
    last_name: "LastName",
    middle_name: "MiddleName",
    position: "Benefits Assistant",
    role: "HR",
    location: "Metrobank Fort - Ecoprime Tower",
    email: "firstname.lastname@metrobank.com.ph",
    contact_number: "09123456789",
    birthDate: "2004-03-24",
    department: "Human Resources",
    profilePic: null,
    username: "firstname.lastname",
    password: "123",
  },
  {
    id: 2,
    employee_id: "00005678",
    first_name: "FirstName",
    last_name: "LastName",
    middle_name: "MiddleName",
    position: "Benefits Services Officer",
    role: "HR",
    location: "Metrobank Makati - Corporate Center",
    email: "firstname.lastname@metrobank.com.ph",
    contact_number: "09987654321",
    birthDate: "1998-08-15",
    department: "Human Resources",
    profilePic: null,
    username: "firstname.lastname",
    password: "456",
  },
  {
    id: 3,
    employee_id: "00009876",
    first_name: "FirstName",
    last_name: "LastName",
    middle_name: "MiddleName",
    position: "Division Head",
    role: "HR",
    location: "Metrobank Ortigas - HQ",
    email: "firstname.lastname@metrobank.com.ph",
    contact_number: "09112223334",
    birthDate: "1985-12-02",
    department: "Human Resources",
    profilePic: null,
    username: "firstname.lastname",
    password: "789",
  },
];

// Export individual users for convenience
export const mockUser = mockUsers[0]; // Default to Benefits Assistant
export default mockUsers;