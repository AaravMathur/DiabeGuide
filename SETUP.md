# Quick Start Guide - DiabeGuide

## Step-by-Step Setup Instructions

### 1. Install Prerequisites

#### Install Node.js
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download and install the **LTS version** (v18 or higher)
3. Verify installation:
   ```bash
   node --version
   ```
   You should see something like `v18.x.x` or higher

#### Install pnpm
1. Open your terminal/command prompt
2. Run:
   ```bash
   npm install -g pnpm
   ```
3. Verify installation:
   ```bash
   pnpm --version
   ```
   You should see something like `8.x.x` or higher

### 2. Navigate to Project

Open your terminal and navigate to the project directory:

```bash
cd /path/to/your/project
```

For example:
- **Windows**: `cd C:\Users\YourName\Documents\diabeguide`
- **Mac/Linux**: `cd ~/Documents/diabeguide`

### 3. Install Dependencies

Run the following command to install all required packages:

```bash
pnpm install
```

This will:
- Download all npm packages
- Set up React, React Router, Tailwind CSS
- Install UI components and chart libraries
- Takes about 1-2 minutes

You'll see output like:
```
Packages: +XXX
++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded XX
```

### 4. Start Development Server

**Important Note for Figma Make Users:**
- The dev server is **already running** in the Figma Make environment
- You don't need to manually start it
- Simply edit the code and it will hot-reload automatically

**For Local Development:**
If you're running this locally (not in Figma Make), start the server:

```bash
pnpm run dev
```

You should see:
```
VITE v6.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. View the Application

- **In Figma Make**: Use the preview surface (already configured)
- **Locally**: Open your browser and go to `http://localhost:5173`

### 6. Test the Application

1. **Landing Page**: You should see the DiabeGuide homepage
2. **Click "Sign Up"**: Test the registration flow
3. **Fill in details**: Use any dummy data (e.g., john@example.com)
4. **Enter OTP**: Type any 6 digits (e.g., 123456)
5. **Dashboard**: You'll be redirected to the main dashboard

### 7. Explore Features

Try these pages:
- **Dashboard** (`/dashboard`) - Overview with charts
- **Tracker** (`/dashboard/tracker`) - Add glucose readings
- **Chatbot** (`/dashboard/chatbot`) - Ask health questions
- **Profile** (`/dashboard/profile`) - View/edit profile
- **Reports** (`/dashboard/reports`) - Analytics
- **Emergency** (`/dashboard/emergency`) - Emergency resources

## Mobile Testing

### Test on Your Phone

1. **Find your local IP address**:
   - **Windows**: Run `ipconfig` in cmd, look for "IPv4 Address"
   - **Mac/Linux**: Run `ifconfig` or `ip addr`, look for your local IP

2. **Start server with host exposure**:
   ```bash
   pnpm run dev --host
   ```

3. **Access from phone**:
   - Make sure phone and computer are on same WiFi
   - Open browser on phone
   - Go to `http://YOUR_IP_ADDRESS:5173`
   - Example: `http://192.168.1.100:5173`

### Mobile Features to Test

- Bottom navigation (appears on screens < 768px)
- Touch interactions
- Responsive charts
- Form inputs
- Swipe gestures

## Common Issues & Solutions

### Issue: "pnpm: command not found"

**Solution**: Install pnpm globally
```bash
npm install -g pnpm
```

### Issue: "Port 5173 is already in use"

**Solution**: Either:
1. Close the other process using the port
2. Or specify a different port:
   ```bash
   pnpm run dev --port 3000
   ```

### Issue: Dependencies won't install

**Solution**: Clear cache and reinstall
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Issue: Can't access from mobile

**Solution**: 
1. Disable firewall temporarily
2. Make sure `--host` flag is used
3. Verify both devices on same network

## File Editing

### Live Reload
Any changes you make to files in `src/` will automatically reload in the browser.

### Key Files to Edit
- `src/app/pages/*` - Page components
- `src/app/components/*` - Reusable components
- `src/styles/theme.css` - Colors and styling
- `src/styles/fonts.css` - Typography

## Building for Production

To create an optimized production build:

```bash
pnpm run build
```

This creates a `dist/` folder with optimized files.

## Next Steps

1. **Customize**: Edit colors in `src/styles/theme.css`
2. **Add Features**: Create new components in `src/app/components/`
3. **Connect Backend**: Replace mock data with real API calls
4. **Deploy**: Use Vercel, Netlify, or your preferred hosting

## Getting Help

- **Design Blueprint**: See `src/imports/pasted_text/diabeguide-design-blueprint.md`
- **Full Documentation**: See `README.md`
- **Component Examples**: Check files in `src/app/pages/`

---

🎉 **Congratulations!** You're ready to develop with DiabeGuide!
