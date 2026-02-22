# 🛡️ Guardian Forge - Standalone Landing Page

This directory contains both the **Next.js web3-integrated frontend** and a **standalone HTML landing page**.

## 📁 Files Overview

### **app/** - Next.js Application
The main web3-integrated application with wallet connection, smart contract interaction, and 3D visualization.

- **page.tsx** - Main landing page with 3D Torus Knot and dashboard
- **contract.ts** - Smart contract utilities and helper functions
- **providers.tsx** - Web3 provider setup (Wagmi + RainbowKit)
- **layout.tsx** - App shell and metadata
- **globals.css** - Global styles

### **index.html** - Standalone Marketing Page
A self-contained, CDN-based landing page that doesn't require a build step or wallet connection.

**Perfect for:**
- Marketing and demos
- Static hosting (GitHub Pages, Netlify, etc.)
- Quick previews without setup overhead
- High-performance loads with CDN dependencies

---

## 🚀 Running the Applications

### Option 1: Next.js Web3 App (Recommended for Full Features)

```bash
npm install
npm run dev
# Open http://localhost:3001
```

**Features:**
✅ Wallet Connection (RainbowKit)  
✅ Smart Contract Interaction  
✅ Real-time Status Dashboard  
✅ Guardian Recovery Management  
✅ 3D Torus Knot Visualization  
✅ Mobile Responsive  

---

### Option 2: Standalone HTML Page (No Build Required)

Serve the `index.html` file directly:

#### **Using npx http-server**
```bash
npx http-server
# Open http://localhost:8080/index.html
```

#### **Using Python**
```bash
# Python 3
python -m http.server 8000
# Open http://localhost:8000/index.html

# Python 2
python -m SimpleHTTPServer 8000
```

#### **Using VS Code Live Server**
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Opens automatically in your browser

#### **Using Node.js (local-web-server)**
```bash
npm install -g local-web-server
ws --spa index.html
```

---

## 🎨 What You'll See

### Next.js App (3001)
```
┌─────────────────────────────────────┐
│  🛡️ GUARDIAN FORGE | [Connect]       │ ← Fixed Header
├─────────────────────────────────────┤
│                                      │
│     WE BUILD DIGITAL REALITIES       │
│     [Initialize Sequence]            │
│                                      │
│  [3D Torus Knot Animation]           │ ← Scroll to see changes
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Connected Wallet             │   │
│  │ Wallet: 0x1234...5678        │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Risk Score: 25 (LOW)         │   │ ← Updates from contract
│  │ Wallet Status: 🔓 Frozen: NO │   │
│  └──────────────────────────────┘   │
│                                      │
└─────────────────────────────────────┘
```

### Standalone HTML (8080)
```
┌─────────────────────────────────────┐
│  We Build Digital Realities          │
│  [Start Your Journey]                │
│                                      │
│  [3D Torus Knot]                     │ ← Pure 3D, no Web3
│                                      │
│  🎯 Strategy                         │
│  🎨 3D Web                           │
│  ⚡ AI Integration                    │
│                                      │
│  🚀 Performance                      │
│  🔐 Security                         │
│  💡 Innovation                       │
│                                      │
│  Ready to Transform?                 │
│  [Get In Touch]                      │
│                                      │
└─────────────────────────────────────┘
```

---

## 🔧 Environment Variables

### Next.js App (.env.local)

```env
# Contract on Polygon Amoy
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc8e7595f40bD5

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional overrides
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/
```

### Standalone HTML
No configuration needed! All settings are hardcoded in the JavaScript.

To customize colors/text, edit the inline `<style>` and `<script>` tags.

---

## 📊 Technology Stack

### Next.js App
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **3D**: Three.js, GSAP animations
- **Web3**: Wagmi, Viem, RainbowKit, ethers.js
- **State**: React Query, Context API
- **Blockchain**: Polygon Amoy testnet
- **Contract Interaction**: Smart contract ABI calls

### Standalone HTML
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **3D**: Three.js (CDN)
- **Animations**: GSAP (CDN)
- **Styling**: Tailwind CSS (CDN)
- **No Dependencies**: Pure vanilla setup

---

## 🎯 When to Use Each

### Use Next.js App When:
- ✅ You need Web3/wallet connection
- ✅ You want to interact with smart contracts
- ✅ You need real-time status updates
- ✅ You're building a full dApp
- ✅ You need SEO or server-side rendering
- ✅ You want professional routing/state management

### Use Standalone HTML When:
- ✅ You need a quick marketing page
- ✅ You want zero configuration
- ✅ You're hosting on static platforms (GitHub Pages)
- ✅ You want super fast load times
- ✅ You don't need blockchain interaction
- ✅ You're sharing an early preview/demo
- ✅ You want to avoid Node.js/build tools entirely

---

## 🚀 Deployment

### Next.js App
```bash
# Vercel (recommended)
npm install -g vercel
vercel

# Or use any Node.js hosting (Netlify, Railway, Heroku, etc.)
```

### Standalone HTML
```bash
# GitHub Pages
git add index.html
git commit -m "Add landing page"
git push origin main
# Enable GitHub Pages in Settings → deploy from main branch

# Netlify (drag and drop)
# Just drag index.html to https://app.netlify.com/drop

# Traditional hosting
# Upload index.html to any web server (Apache, Nginx, etc.)
```

---

## 🔒 Security Notes

### Next.js App
- Never commit `.env.local` (add to `.gitignore`)
- Private keys never exposed to frontend
- Contract calls are signed by user's wallet
- WalletConnect Project ID is public (that's okay)

### Standalone HTML
- No sensitive data in JavaScript
- All code is client-side (visible in browser)
- Perfect for marketing/demo purposes
- Don't put private keys here!

---

## 💡 Pro Tips

1. **During Development**: Use Next.js app for full features
2. **For Marketing**: Use standalone HTML (faster, simpler)
3. **For Performance**: Both are highly optimized
   - Three.js with antialiasing enabled
   - Low pixel ratio on mobile
   - GSAP for smooth 60fps animations
4. **Mobile First**: Both are fully responsive
5. **Dark Mode**: Both use professional dark/cyber aesthetic

---

## 🆘 Troubleshooting

### "Port 3001 already in use"
```bash
# Find and kill the process
lsof -i :3001
kill -9 <PID>

# Or choose a different port
npm run dev -- -p 3002
```

### "Module not found" error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "3D scene not rendering"
- Check browser console for WebGL errors
- Ensure GPU acceleration is enabled
- Try a different browser (Chrome recommended)
- Check Three.js version compatibility

### "Wallet connection fails"
- Verify WalletConnect Project ID is set
- Check you're on Polygon Amoy network
- Ensure wallet supports Amoy testnet
- Try reconnecting wallet

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Three.js Docs](https://threejs.org/docs/)
- [GSAP Docs](https://gsap.com/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [Polygon Docs](https://wiki.polygon.technology/)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Happy Building! 🚀**
