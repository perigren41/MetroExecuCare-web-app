# MetroExecuCare Development Setup

## 🚀 Quick Start

### Option 1: Single Command (Recommended)
```bash
npm run dev
```
This starts both backend and frontend simultaneously with auto-restart.

### Option 2: Windows Batch File
Double-click `start-dev.bat` to launch both servers in separate windows.

### Option 3: Manual Start
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

## 📍 Fixed Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔄 Auto-Restart Configuration

### Backend (Node.js + Express)
- **Tool**: Nodemon
- **Command**: `npm run dev`
- **Watches**: All `.js`, `.json`, `.env` files
- **Restarts**: Automatically when files change

### Frontend (React + Vite)
- **Tool**: Vite HMR (Hot Module Replacement)
- **Command**: `npm run dev`
- **Features**:
  - Instant updates for React components
  - CSS hot reloading
  - Fast refresh without losing state

## ⚙️ Port Configuration

### Fixed Ports (No More Port Conflicts!)
- **Backend**: Always port 5000 (configured in `Backend/.env`)
- **Frontend**: Always port 3000 (configured in `Frontend/vite.config.js`)
- **Strict Mode**: Fails if port is occupied (prevents auto-increment)

### Environment Files
```
# Backend/.env
PORT=5000

# Frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🛠️ Available Scripts

From the root directory:

```bash
# Development (both servers with auto-restart)
npm run dev

# Development (individual servers)
npm run dev:backend
npm run dev:frontend

# Production start
npm start

# Install all dependencies
npm run install:all

# Build for production
npm run build

# Run tests
npm test

# Clean all node_modules
npm run clean
```

## 🔧 Configuration Files

- `Backend/.env` - Backend environment variables
- `Frontend/.env` - Frontend environment variables
- `Backend/nodemon.json` - Nodemon configuration
- `Frontend/vite.config.js` - Vite configuration
- `package.json` - Root workspace configuration

## ✅ Development Workflow

1. **Start Development**: Run `npm run dev` or `start-dev.bat`
2. **Make Changes**: Edit any file in Backend or Frontend
3. **Auto-Restart**:
   - Backend restarts automatically via Nodemon
   - Frontend updates instantly via Vite HMR
4. **No Manual Restarts**: Both servers handle file changes automatically
5. **Fixed URLs**: Always use the same localhost URLs

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

### Clear Cache
```bash
npm run clean
npm run install:all
```

### Reset Development Environment
```bash
# Stop all servers
# Run clean install
npm run clean && npm run install:all && npm run dev
```