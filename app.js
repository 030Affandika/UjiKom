const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Fungsi untuk menulis data ke file CSV
function writeToCSV(data) {
  const csvLine = `${data.name},${data.school},${data.age},${data.address},${data.phone},${data.shape},${data.result},${new Date().toISOString()}\n`;
  fs.appendFile('hasil.csv', csvLine, (err) => {
    if (err) throw err;
    console.log('Data disimpan ke CSV');
  });
}

// Route untuk menangani pengiriman form
app.post('/calculate', (req, res) => {
  const { name, school, age, address, phone, shape, dimension1, dimension2 } = req.body;
  let result;

  // Menghitung berdasarkan jenis bangun yang dipilih
  switch (shape) {
    case 'square':
      result = dimension1 * dimension1;
      break;
    case 'triangle':
      result = 0.5 * dimension1 * dimension2;
      break;
    case 'circle':
      result = Math.PI * dimension1 * dimension1;
      break;
    case 'cube':
      result = Math.pow(dimension1, 3);
      break;
    case 'pyramid':
      result = (1/3) * Math.pow(dimension1, 2) * dimension2;
      break;
    case 'cylinder':
      result = Math.PI * Math.pow(dimension1, 2) * dimension2;
      break;
    default:
      result = 'Bangun tidak valid';
  }

  const data = {
    name,
    school,
    age,
    address,
    phone,
    shape,
    result
  };

  // Simpan data ke CSV
  writeToCSV(data);

  // Kirim hasil dan tautan unduhan
  res.send(`
    <h2>Hasil Perhitungan: ${result}</h2>
    <a href="/download">Unduh CSV</a>
    <br><br>
    <a href="/results">Lihat Semua Hasil</a>
    <br><br>
    <a href="/">Kembali</a>
  `);
});

// Route untuk mengunduh file CSV
app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'hasil.csv');
  res.download(filePath, 'hasil.csv', (err) => {
    if (err) {
      console.error('Error saat mengirim file:', err);
      res.status(500).send('Error mengunduh file.');
    }
  });
});

// Route untuk melihat semua hasil
app.get('/results', (req, res) => {
  fs.readFile('hasil.csv', 'utf8', (err, data) => {
    if (err) {
      console.error('Error saat membaca file:', err);
      res.status(500).send('Error membaca hasil.');
      return;
    }

    const rows = data.split('\n').filter(row => row.trim() !== '');
    const tableRows = rows.map(row => {
      const cols = row.split(',');
      return `<tr>${cols.map(col => `<td>${col}</td>`).join('')}</tr>`;
    }).join('');

    res.send(`
      <h2>Semua Hasil Perhitungan</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Sekolah</th>
            <th>Usia</th>
            <th>Alamat</th>
            <th>Nomor Telepon</th>
            <th>Jenis Bangun</th>
            <th>Hasil</th>
            <th>Tanggal dan Jam</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <br><br>
      <a href="/download">Unduh CSV</a>
      <br><br>
      <a href="/">Kembali</a>
    `);
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
