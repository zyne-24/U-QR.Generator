// Get references to HTML elements
const input = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const colorPicker = document.getElementById('qr-color');
const qrContainer = document.getElementById('qr-code');
const downloadBtn = document.getElementById('download-btn');
const autoInfo = document.getElementById('auto-info');
const historyList = document.getElementById('history-list');

let qr; // QRCode object

// Function to create a new QR code
function updateQR(text) {
  qrContainer.innerHTML = ''; // Clear previous QR
  qr = new QRCode(qrContainer, {
    text: text,
    width: 256,
    height: 256,
    colorDark: colorPicker.value, // use selected color
    colorLight: "#ffffff", // white background
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Function to detect content type and apply styling
function detectContent(text) {
  autoInfo.className = "info-box"; // reset class

  if (text.startsWith('http://') || text.startsWith('https://')) {
    autoInfo.classList.add("url-info");
    autoInfo.textContent = "🔗 Detected as URL.";
  } else if (/^\d{9,}$/.test(text)) {
    autoInfo.classList.add("phone-info");
    autoInfo.innerHTML = "📞 Detected as phone number.<br><a href='https://wa.me/" + text + "' target='_blank'>Open in WhatsApp</a>";
  } else {
    autoInfo.classList.add("text-info");
    autoInfo.textContent = "📝 Detected as plain text.";
  }
}

// Save generated QR content to local storage (history)
function saveToHistory(text) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  if (!history.includes(text)) {
    history.unshift(text); // add to beginning
    if (history.length > 5) history.pop(); // keep only 5
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }
  renderHistory();
}

// Display QR history list
function renderHistory() {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  historyList.innerHTML = "";

  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.onclick = () => {
      input.value = item;
      generateQR(); // generate QR when item clicked
    };
    historyList.appendChild(li);
  });
}

// Main function to generate QR and handle logic
function generateQR() {
  const text = input.value.trim();
  if (!text) return;

  updateQR(text);
  detectContent(text);
  saveToHistory(text);
}

// Generate QR only when button is clicked
generateBtn.addEventListener('click', generateQR);

// Update QR if color is changed (only if input is not empty)
colorPicker.addEventListener('change', () => {
  if (input.value.trim()) {
    generateQR();
  }
});

// Download the generated QR code as PNG
downloadBtn.addEventListener('click', () => {
  const img = qrContainer.querySelector('img');
  if (!img) return;
  const link = document.createElement('a');
  link.href = img.src;
  link.download = 'qrcode_zyne.png';
  link.click();
});

// Load history on page load
renderHistory();
