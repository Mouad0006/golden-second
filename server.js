const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8800;

app.use(express.json());
const LOG_FILE = path.join(__dirname, 'successful-logs.json');

// حذف كل الطلبات الناجحة
app.get('/clear', (req, res) => {
  fs.writeFileSync(LOG_FILE, '[]');
  res.redirect('/');
});

// استلام الطلب الناجح وتسجيله
app.post('/log-success', (req, res) => {
  const entry = { ...req.body, isoTime: new Date().toISOString(), ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress };
  let all = [];
  if (fs.existsSync(LOG_FILE)) {
    all = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  }
  all.unshift(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(all, null, 2));
  res.json({ ok: true });
});

// صفحة العرض العصرية
app.get('/', (req, res) => {
  let all = [];
  if (fs.existsSync(LOG_FILE)) {
    all = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  }
  let rows = all.map((log, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${log.time || ''}</td>
      <td>${log.entryTime || ''}</td>
      <td>${log.isoTime ? new Date(log.isoTime).toLocaleString() : ''}</td>
      <td style="font-size:12px;word-break:break-all">${log.href || ''}</td>
      <td style="font-size:12px;">${log.ip || ''}</td>
      <td style="font-size:11.3px;">${log.userAgent || ''}</td>
    </tr>
  `).join('');
  res.send(`
  <!DOCTYPE html>
  <html lang="ar">
  <head>
    <meta charset="UTF-8" />
    <title>🟡 MILANO GOLDEN SECOND - Success Log</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body {
        background: linear-gradient(120deg,#fdf7e3 65%,#fff7d1 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        color: #604a10;
        min-height: 100vh;
      }
      .container {
        max-width: 1050px;
        margin: 32px auto;
        padding: 27px 20px 23px 20px;
        background: rgba(255,252,220,0.88);
        border-radius: 21px;
        box-shadow: 0 10px 45px #ccb87122;
        border: 2.3px solid #e4c450;
      }
      h2 {
        color: #bfa750;
        font-size: 2.1em;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
        letter-spacing: 1.4px;
        margin-bottom: 24px;
        text-shadow: 0 1px 2.7px #fff8;
      }
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 7px;
        background: none;
      }
      thead th {
        background: linear-gradient(98deg,#fffbeedc 55%,#fde6a5 120%);
        color: #bfa750;
        padding: 11px 7px 8px 7px;
        font-size: 1.08em;
        font-weight: bold;
        border-bottom: 2.2px solid #dec76b;
        border-top-left-radius: 11px;
        border-top-right-radius: 11px;
        letter-spacing: .85px;
        box-shadow: 0 3px 16px #e7cf8f13;
      }
      tbody tr {
        background: #fcf7e4;
        border-radius: 13px;
        box-shadow: 0 3px 16px #e7cf8f17;
        transition: box-shadow .16s;
      }
      tbody tr:hover {
        box-shadow: 0 6px 28px #e7cf8f24;
        background: #fff8e3;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1.2px solid #f4e7bc;
        font-size: 1.06em;
      }
      .gold-badge {
        background: linear-gradient(93deg,#ffe9aa 60%,#f7d372 110%);
        color: #ad8500;
        font-weight: 700;
        border-radius: 7px;
        padding: 5px 12px;
        font-size: 1.1em;
        margin-bottom: 16px;
        box-shadow: 0 3px 13px #e7cf8f12;
        border: 1.3px solid #ecd37d;
        display: inline-block;
      }
      .delete-btn {
        background: linear-gradient(95deg,#fff3b6,#e4c450 110%);
        color: #775b09;
        border: none;
        font-size: 1em;
        font-family: inherit;
        font-weight: 700;
        padding: 10px 24px;
        border-radius: 10px;
        cursor: pointer;
        margin: 17px auto 13px auto;
        display: block;
        transition: box-shadow .12s,filter .14s;
        box-shadow: 0 2px 10px #dcc06730;
        letter-spacing: .9px;
      }
      .delete-btn:hover {
        filter: brightness(1.10);
        box-shadow: 0 5px 24px #d4bb4e38;
        color: #bfa750;
        background: linear-gradient(96deg,#fff6ce,#e4c450 100%);
      }
      @media (max-width: 800px) {
        .container {padding:9px 1vw;}
        td, thead th {font-size:14px;}
        table {font-size:13.3px;}
      }
      @media (max-width: 480px) {
        h2 {font-size:1.1em;}
        .container {padding:2vw;}
        td, thead th {font-size:11.9px;}
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="gold-badge">🟡 MILANO - GOLDEN SECOND (SUCCESSFUL REQUESTS)</div>
      <form method="get" action="/clear" onsubmit="return confirm('متأكد أنك تريد حذف كل السجلات؟');">
        <button class="delete-btn" type="submit">🗑️ حذف كل الطلبات</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Second</th>
            <th>Entry</th>
            <th>Recorded At</th>
            <th>Href</th>
            <th>IP</th>
            <th>UserAgent</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="8" style="text-align:center;color:#a9a176;">لا توجد طلبات</td></tr>'}
        </tbody>
      </table>
    </div>
  </body>
  </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
