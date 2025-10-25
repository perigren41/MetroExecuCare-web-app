**Security Implementation**
## Authentication & Authorization:
- Specify these for me: // JWT Token Flow:
1. User logs in → Credentials sent to /api/auth/login
2. Backend validates → Generates JWT with user payload
3. Token stored in localStorage (Frontend)
4. Every request includes: Authorization: Bearer <token>
5. Backend middleware verifies token before processing
- in number 4, What do you mean by Every request? How can we know in the system that an action is a request?

- What does the middleware do and can you specify me the value it gives to the system
- Deeply explain what does JWT do in our system
- How does multer sanitizes filenames, what does it actually do
## Security Layers:
- Deeply explain what is all of our security layers, from bcrypt.js to File upload security.

**Frontend Features & UX Decisions**
## State management
- Can you deeply explain AuthContext

**Q: What's your data backup strategy?**
A: Railway provides automated daily backups. We can also manually export MySQL dumps. In production, we'd implement hourly incremental backups.
- Can you specify the "we'd implement hourly incremental backups", where and when did we implement this?

**ERD**
- Kindly explain to me in details about our ERD and how I can present this I only have an image regarding this in backend/uploads named MetroExecuCare_ERD.drawio (1).png