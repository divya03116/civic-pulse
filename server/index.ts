import app from './app';
import { storage } from './storage';

const PORT = process.env.PORT || 5000;

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🏛️  CivicPulse AI Server running on http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: Active (NLP, Vision, Geo-Duplicates)`);
  console.log(`📊 Storage: Cloud Firestore (connecting...)`);
  console.log(`==================================================\n`);
  storage.connect();
});
