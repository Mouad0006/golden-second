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

// صفحة العرض العصرية المتطورة
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
      <td style="font-size:12px;word-break:break-all;max-width:180px;">${log.href || ''}</td>
      <td style="font-size:12px;">${log.ip || ''}</td>
      <td style="font-size:11.3px;max-width:200px;overflow:auto;">${log.userAgent || ''}</td>
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
        background: linear-gradient(115deg,#0d1117 0%,#2c2e32 100%);
        min-height: 100vh;
        font-family: 'Segoe UI', 'Cairo', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #faf9f7;
      }
      .container {
        max-width: 1100px;
        margin: 38px auto;
        padding: 30px 24px 22px 24px;
        background: rgba(26,27,30,0.98);
        border-radius: 22px;
        box-shadow: 0 7px 40px #1414133d;
        border: 2.8px solid #d8ba63;
      }
      h2 {
        color: #d8ba63;
        font-size: 2.18em;
        font-family: 'Segoe UI', sans-serif;
        text-align: center;
        letter-spacing: 1.1px;
        margin-bottom: 29px;
        text-shadow: 0 2px 8px #c8b27e27;
      }
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 9px;
        background: none;
        margin-bottom: 15px;
      }
      thead th {
        background: #1a1915e6;
        color: #d8ba63;
        padding: 13px 8px 10px 8px;
        font-size: 1.09em;
        font-weight: 700;
        border-bottom: 2.6px solid #d8ba63bb;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        letter-spacing: .8px;
        box-shadow: 0 1px 12px #0002;
      }
      tbody tr {
        background: linear-gradient(90deg,#222325e0 60%,#181818e0 100%);
        border-radius: 13px;
        box-shadow: 0 3px 18px #00000018;
        transition: box-shadow .16s, background .12s;
        color: #e8e6e3;
      }
      tbody tr:hover {
        box-shadow: 0 10px 34px #d8ba6340, 0 2px 9px #0006;
        background: linear-gradient(90deg,#242625 50%,#2b2c28 100%);
        color: #fffcf7;
      }
      td {
        padding: 11px 7px;
        border-bottom: 1.4px solid #36332c88;
        font-size: 1.03em;
        max-width: 230px;
        overflow-x: auto;
      }
      .gold-badge {
        background: linear-gradient(98deg,#fffbeec9 30%,#d8ba63 110%);
        color: #191817;
        font-weight: 800;
        border-radius: 10px;
        padding: 7px 21px;
        font-size: 1.18em;
        margin-bottom: 21px;
        box-shadow: 0 3px 14px #e7cf8f09;
        border: 2px solid #d8ba63;
        display: inline-block;
        letter-spacing: .6px;
      }
      .delete-btn {
        background: linear-gradient(92deg,#232220 20%,#d8ba63 100%);
        color: #fff;
        border: none;
        font-size: 1.04em;
        font-family: inherit;
        font-weight: 700;
        padding: 11px 29px;
        border-radius: 12px;
        cursor: pointer;
        margin: 19px auto 14px auto;
        display: block;
        transition: box-shadow .12s,filter .14s, background .14s, color .13s;
        box-shadow: 0 2px 14px #d8ba6340;
        letter-spacing: 1.1px;
      }
      .delete-btn:hover {
        filter: brightness(1.10) saturate(1.03);
        box-shadow: 0 5px 24px #d8ba6348;
        background: linear-gradient(92deg,#33312a 5%,#ffecbc 85%);
        color: #ae8c13;
      }
      @media (max-width: 900px) {
        .container {padding:7px 2vw;}
        td, thead th {font-size:13px;}
        table {font-size:13.1px;}
      }
      @media (max-width: 480px) {
        h2 {font-size:1em;}
        .container {padding:2vw;}
        td, thead th {font-size:11.6px;}
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="gold-badge">🟡 MILANO - GOLDEN SECOND (SUCCESSFUL REQUESTS)</div>
      <form method="get" action="/clear" onsubmit="return confirm('متأكد أنك تريد حذف كل السجلات؟');">
        <button class="delete-btn" type="submit">🗑️ حذف كل الطلبات</button>
      </form>
      <h2>سجل الطلبات الناجحة</h2>
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
          ${rows || '<tr><td colspan="8" style="text-align:center;color:#e7d790;">لا توجد طلبات</td></tr>'}
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
