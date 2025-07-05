# 🗺️ Google Maps API Setup for Arboracle

## Step 1: Get Your Google Maps API Key

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Name it something like "Arboracle Maps"

### 1.2 Enable Required APIs
Go to "APIs & Services" > "Library" and enable:
- **Maps JavaScript API** (for interactive maps)
- **Places API** (for location search)
- **Geocoding API** (for address conversion)

### 1.3 Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 1.4 Secure Your API Key (IMPORTANT!)
1. Click on your API key to edit it
2. Under "Application restrictions":
   - For development: Choose "HTTP referrers"
   - Add: `localhost:3000/*`, `127.0.0.1:3000/*`
   - For production: Add your domain: `yourdomain.com/*`
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose: Maps JavaScript API, Places API, Geocoding API

## Step 2: Configure in Your Deployment Platform

### For Vercel:
1. Go to your Vercel dashboard
2. Select your Arboracle project
3. Go to "Settings" > "Environment Variables"
4. Add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" > "Environment variables"
4. Add:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### For GitHub Codespaces:
1. In your Codespace terminal:
   ```bash
   echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here" >> .env.local
   ```

### For Local Development:
1. In your `.env.local` file:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## Step 3: Verify Implementation

### Current Arboracle Google Maps Integration:
✅ **TreeMapView Component** - Displays trees on interactive map
✅ **LocationPickerMap Component** - Allows users to pick locations
✅ **@react-google-maps/api** - Already installed and configured
✅ **Environment variable setup** - Ready for your API key

### Test Your Setup:
1. Deploy/run your application
2. Go to `/map` page
3. You should see an interactive Google Map
4. Go to "Add Tree" and test "Pick on Map" functionality

## Step 4: Features You'll Get

### Interactive Tree Map:
- View all trees on satellite/street view
- Click markers to see tree details
- Zoom and pan functionality
- Tree icons change based on age/health

### Location Picker:
- Click anywhere on map to set tree location
- Automatic GPS coordinate capture
- Plus code generation
- Address geocoding

### Advanced Features (Future):
- Satellite imagery overlays
- Tree health visualization
- Route planning for arborists
- Geofenced notifications

## Troubleshooting

### Map Not Loading?
1. Check browser console for errors
2. Verify API key is correct
3. Ensure APIs are enabled in Google Cloud
4. Check domain restrictions

### "This page can't load Google Maps correctly"?
1. API key might be restricted
2. Billing not enabled (Google requires billing account)
3. Daily quota exceeded

### Need Help?
- Google Maps Platform documentation: https://developers.google.com/maps
- Check the browser console for specific error messages
- Verify your API key has the correct permissions

## Cost Considerations

### Google Maps Pricing:
- **Free tier**: $200 credit per month
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

### For Arboracle Usage:
- Small to medium usage should stay within free tier
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid surprises

## Security Best Practices

1. **Never expose API key in client-side code** (use environment variables)
2. **Restrict API key to specific domains**
3. **Enable only required APIs**
4. **Monitor usage regularly**
5. **Rotate keys periodically**

---

🌳 **Once configured, Arboracle's map features will be fully functional and ready to help manage trees across the globe!** ✨