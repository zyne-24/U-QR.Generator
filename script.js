// Elements references
const input = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const colorPicker = document.getElementById("qr-color");
const sizeSlider = document.getElementById("qr-size");
const sizeDisplay = document.getElementById("size-display");
const logoUpload = document.getElementById("logo-upload");
const qrContainer = document.getElementById("qr-code");
const autoInfo = document.getElementById("auto-info");
const progressBar = document.getElementById("progress-bar");
const historyList = document.getElementById("history-list");
const toggleHistory = document.getElementById("toggle-history");
const historyContainer = document.getElementById("history-container");
const themeToggle = document.getElementById("theme-toggle");

let qrCode;
let uploadedLogo = null;
let currentSize = parseInt(sizeSlider.value);

// Template logos URLs
const templates = {
  wa: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  ig: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
  fb: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  web: "https://upload.wikimedia.org/wikipedia/commons/8/89/OOjs_UI_icon_globe.svg"
};

// Initialize QR Code Styling instance
qrCode = new QRCodeStyling({
  width: currentSize,
  height: currentSize,
  data: "",
  dotsOptions: {
    color: colorPicker.value,
    type: "rounded"
  },
  backgroundOptions: {
    color: "transparent"
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
    imageSize: 0.2 // 20% of QR size for logo
  }
});

// Function to resize uploaded logo to 100x100 max
function resizeImage(file, callback) {
  const reader = new FileReader();
  const img = new Image();
  reader.onload = e => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 100;
      canvas.height = 100;

      // Clear canvas & draw resized image
      ctx.clearRect(0, 0, 100, 100);
      ctx.drawImage(img, 0, 0, 100, 100);

      const dataUrl = canvas.toDataURL("image/png");
      callback(dataUrl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Generate QR code with progress bar animation
function generateQR() {
  const text = input.value.trim();
  if (!text) return;

  showProgress(() => {
    detectContent(text);
    saveToHistory(text);

    qrCode.update({
      data: text,
      width: currentSize,
      height: currentSize,
      dotsOptions: { color: colorPicker.value },
      image: uploadedLogo
    });

    qrContainer.innerHTML = "";
    qrCode.append(qrContainer);
  });
}

// Progress bar animation helper
function showProgress(callback) {
  progressBar.style.display = "block";
  progressBar.value = 0;
  let value = 0;
  const interval = setInterval(() => {
    value += 10;
    progressBar.value = value;
    if (value >= 100) {
      clearInterval(interval);
      progressBar.style.display = "none";
      callback();
    }
  }, 40);
}

// Detect input content type and update info text
function detectContent(text) {
  if (/^https?:\/\//i.test(text)) {
    autoInfo.textContent = "🔗 Detected URL.";
  } else if (/^\d{9,}$/.test(text)) {
    autoInfo.innerHTML = `📞 Phone number detected. <br>Click <a href="https://wa.me/${text}" target="_blank" rel="noopener noreferrer">open WhatsApp</a>`;
  } else {
    autoInfo.textContent = "📝 Plain text.";
  }
}

// Save to localStorage history and render list
function saveToHistory(text) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  if (!history.includes(text)) {
    history.unshift(text);
    if (history.length > 10) history.pop(); // keep last 10
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }
  renderHistory();
}

// Render history list in UI
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.tabIndex = 0;
    li.addEventListener("click", () => {
      input.value = item;
      generateQR();
    });
    li.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        input.value = item;
        generateQR();
      }
    });
    historyList.appendChild(li);
  });
}

// Download QR code as PNG with custom filename
function downloadQR() {
  qrCode.getRawData("png").then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode | zyne.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

// Upload logo and resize it
logoUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImage(file, dataUrl => {
    uploadedLogo = dataUrl;
    generateQR();
  });
});

// Template logos buttons
document.querySelectorAll(".template-btn").forEach(button => {
  button.addEventListener("click", () => {
    const logoKey = button.getAttribute("data-logo");
    uploadedLogo = templates[logoKey];
    generateQR();
  });
});

// QR size slider change
sizeSlider.addEventListener("input", () => {
  currentSize = parseInt(sizeSlider.value);
  sizeDisplay.textContent = `${currentSize}px`;
  if (input.value.trim()) {
    generateQR();
  }
});

// Color picker change
colorPicker.addEventListener("input", () => {
  if (input.value.trim()) {
    generateQR();
  }
});

// Generate button click
generateBtn.addEventListener("click", generateQR);
input.addEventListener("input", () => {
  const text = input.value.trim();
  detectContent(text);
});


// Download button click
downloadBtn.addEventListener("click", downloadQR);

// History toggle
toggleHistory.addEventListener("click", () => {
  const isHidden = historyContainer.style.display === "none";
  historyContainer.style.display = isHidden ? "block" : "none";
  toggleHistory.textContent = isHidden ? "📜 Hide History" : "📜 Show History";
  toggleHistory.setAttribute("aria-expanded", isHidden);
});

// Theme toggle: dark/light
themeToggle.addEventListener('click', () => {
  const icon = themeToggle.querySelector('i');
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');

  if (currentTheme === 'dark') {
    html.setAttribute('data-theme', 'light');
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    html.setAttribute('data-theme', 'dark');
    icon.classList.replace('fa-sun', 'fa-moon');
  }
});


// Initialize UI and render history on page load
document.addEventListener("DOMContentLoaded", () => {
  sizeDisplay.textContent = `${currentSize}px`;
  renderHistory();
});