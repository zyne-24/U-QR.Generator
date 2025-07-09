const input = document.getElementById('qr-input');
const colorPicker = document.getElementById('qr-color');
const qrContainer = document.getElementById('qr-code');
const downloadBtn = document.getElementById('download-btn');
const autoInfo = document.getElementById('auto-info');
const historyList = document.getElementById('history-list');

let qr;

function updateQR(text) {
  qrContainer.innerHTML = ''; // Clear QR
  qr = new QRCode(qrContainer, {
    text: text,
    width: 256,
    height: 256,
    colorDark: colorPicker.value,
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function detectContent(text) {
  if (text.startsWith('http://') || text.startsWith('https://')) {
    autoInfo.textContent = "🔗 Terdeteksi sebagai URL.";
  } else if (/^\d{9,}$/.test(text)) {
    autoInfo.innerHTML = "📞 Nomor HP terdeteksi. <br/>Klik <a href='https://wa.me/" + text + "' target='_blank'>buka WhatsApp</a>";
  } else {
    autoInfo.textContent = "📝 Teks biasa.";
  }
}

function saveToHistory(text) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  if (!history.includes(text)) {
    history.unshift(text);
    if (history.length > 5) history.pop(); // keep last 5
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => {
      input.value = item;
      generateQR();
    };
    historyList.appendChild(li);
  });
}

function generateQR() {
  const text = input.value.trim();
  if (!text) return;
  updateQR(text);
  detectContent(text);
  saveToHistory(text);
}

input.addEventListener('input', generateQR);
colorPicker.addEventListener('change', generateQR);

downloadBtn.addEventListener('click', () => {
  const img = qrContainer.querySelector('img');
  if (!img) return;
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'qrcode.png';
  link.click();
});

// Load history on page load
renderHistory();
