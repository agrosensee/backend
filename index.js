// server.js (və ya index.js)
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors({ origin: '*' })); // Production-da konkret domenləri qoyun
app.use(express.json({ limit: '10mb' }));
// testing
// data.json faylının avtomatik yaradılması
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
  console.log('data.json faylı avtomatik yaradıldı');
}

// Helper funksiyalar
function readData() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error('data.json oxuma xətası:', e.message);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('data.json yazma xətası:', e.message);
    throw e;
  }
}

// GET — bütün abunəlik qeydləri
app.get('/items', (req, res) => {
  const data = readData();
  res.json(data);
});

// POST — yeni abunəlik qeydi
app.post('/items', (req, res) => {
  try {
    console.log('POST /items → gələn məlumat:', req.body);

    const data = readData();

    const newItem = {
      id: Date.now().toString(),
      ...req.body,
      received_at: new Date().toISOString(),
    };

    data.push(newItem);
    writeData(data);

    console.log('Yeni qeyd əlavə olundu → ID:', newItem.id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('POST xətası:', error);
    res.status(500).json({ error: 'Server daxili xəta', details: error.message });
  }
});

// Sadə health check
app.get('/', (req, res) => {
  res.send('Abunəlik backend-i işləyir ✅');
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} ünvanında işləyir`);
  console.log(`Bütün qeydləri görmək üçün: http://localhost:${PORT}/items`);
});