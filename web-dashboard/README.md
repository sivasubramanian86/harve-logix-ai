# HarveLogix AI - Web Dashboard

A beautiful, responsive React dashboard for the HarveLogix AI platform with real-time metrics, analytics, and visualizations.

## 🎨 Features

- **Real-time Dashboard** - Live metrics and KPIs
- **Interactive Charts** - Income trends, agent usage, processor utilization
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Multi-page Navigation** - Dashboard, Welfare, Supply Chain, Analytics
- **Beautiful UI** - Built with Tailwind CSS and Lucide icons
- **Fast Performance** - Built with Vite for instant HMR

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview
```

The dashboard will be available at `http://localhost:3000`

## 📊 Pages

### Dashboard
- **Metrics Cards**: Total farmers, active users, income, waste reduction
- **Income Growth Chart**: 6-month trend visualization
- **Agent Usage Pie Chart**: Distribution of agent usage
- **Top Crops Table**: Income breakdown by crop type

### Farmer Welfare
- **Income Distribution**: Histogram showing farmer income ranges
- **Regional Growth**: Income growth trends by state
- **Scheme Enrollment**: Government scheme participation tracking

### Supply Chain
- **Processor Utilization**: Capacity usage visualization
- **Weekly Supply Matches**: Success rate trends
- **Processor Performance**: Detailed metrics table

### Analytics
- **Growth Trends**: Platform growth over time
- **Agent Accuracy**: Improvement in agent predictions
- **Agent Performance**: Individual agent metrics

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Router** - Navigation
- **Axios** - HTTP client

## 📁 Project Structure

```
web-dashboard/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard page
│   │   ├── FarmerWelfare.jsx   # Welfare page
│   │   ├── SupplyChain.jsx     # Supply chain page
│   │   └── Analytics.jsx       # Analytics page
│   └── components/
│       ├── Navbar.jsx          # Top navigation
│       └── Sidebar.jsx         # Side navigation
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
```

## 🎯 API Integration

The dashboard connects to the backend API at `http://localhost:5000`:

```javascript
// Example API call
const response = await axios.get('/api/metrics')
```

### Available Endpoints

- `GET /metrics` - Dashboard metrics
- `GET /welfare` - Farmer welfare data
- `GET /supply-chain` - Supply chain data
- `GET /analytics` - Analytics data

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#10b981',      // Green
      secondary: '#059669',    // Dark green
      accent: '#f59e0b',       // Amber
    }
  }
}
```

### Charts
Modify chart components in `src/pages/` to customize visualizations:

```jsx
<LineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="income" stroke="#10b981" />
</LineChart>
```

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full sidebar + content
- **Tablet**: Collapsible sidebar
- **Mobile**: Mobile-optimized layout

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚀 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to AWS S3
aws s3 sync dist/ s3://your-bucket-name/
```

## 🔧 Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=HarveLogix AI
```

## 📊 Mock Data

The dashboard uses mock data from the backend. To use real data:

1. Update API endpoints in `src/pages/`
2. Replace mock data generators with real API calls
3. Handle loading and error states

## 🎯 Performance Tips

1. **Code Splitting** - Routes are automatically code-split by Vite
2. **Image Optimization** - Use optimized images
3. **Lazy Loading** - Components load on demand
4. **Caching** - Browser caching enabled

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Backend Not Responding
```bash
# Check backend health
curl http://localhost:5000/health
```

## 📚 Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Ready to Use!

The dashboard is production-ready and can be deployed to any hosting platform:
- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

---

**Made with ❤️ for Indian Agriculture**
