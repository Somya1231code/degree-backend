// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
//const mongoose = require('mongoose');

// Ensure MONGO_URI is defined
const mongoURI = process.env.MONGO_URI;
console.log(mongoURI)

if (!mongoURI) {
  console.error('Error: MONGO_URI is not defined in environment variables.');
  process.exit(1); // Exit the process if no URI is provided
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit the process on failure
  });


// Import Degree model
const Degree = require('./models/Degree');

// Route to add a new degree and generate a unique hash
app.get('/', async (req, res) => {
  res.json({"message": "hello"});
});

app.post('/api/add-degree', async (req, res) => {
  try {
    
    const { name, course, university, graduationYear } = req.body;

    // Generate a unique hash (simple version – can be replaced with crypto)
    const hash = `${name}-${course}-${university}-${graduationYear}-${Date.now()}`.replace(/\s/g, '');

    const degree = new Degree({
      name,
      course,
      university,
      graduationYear,
      hash
    });

    await degree.save();
    res.status(201).json({ message: 'Degree added successfully', hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add degree' });
  }
});

// Route to verify a degree using hash
app.get('/api/verify/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const degree = await Degree.findOne({ hash });

    if (!degree) {
      return res.status(404).json({ valid: false, message: 'Degree not found or invalid' });
    }

    res.json({ valid: true, degree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
});
  
// Route to generate QR code for a degree hash
app.get('/api/generate-qr/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const url = `http://localhost:5000/api/verify/${hash}`;

   // Generate QR code image
    QRCode.toDataURL(url, (err, src) => {
      if (err) return res.status(500).json({ error: 'Failed to generate QR code' });

      res.json({ qrImage: src, verifyURL: url });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
