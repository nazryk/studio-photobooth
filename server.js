const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use('/photos', express.static('uploads'));

// Jalur untuk menerima foto dari Frontend
app.post('/upload', async (req, res) => {
    try {
        const { imageBase64, baseUrl } = req.body;
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
        const filename = `foto_${Date.now()}.png`;
        const uploadDir = path.join(__dirname, 'uploads');

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        fs.writeFileSync(path.join(uploadDir, filename), base64Data, 'base64');
        
// Menghilangkan slash di akhir baseUrl (jika ada) agar link tidak double slash
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const photoUrl = `${cleanBaseUrl}/photos/${filename}`;
        const qrCodeDataUrl = await QRCode.toDataURL(photoUrl, { width: 300 });

        console.log(`[Sistem] Foto disimpan: ${filename}`);
        res.json({ success: true, qrCode: qrCodeDataUrl, photoName: filename });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`📸 PHOTOBOOTH SERVER AKTIF`);
    console.log(`📍 Akses lokal: http://localhost:${PORT}`);
    console.log(`======================================\n`);
});