// Element references
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

// Template logo URLs
const templates = {
  wa: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  ig: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
  fb: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
  web: "https://upload.wikimedia.org/wikipedia/commons/8/89/OOjs_UI_icon_globe.svg"
};

// Init QR Code
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
    imageSize: 0.2
  }
});

// Resize uploaded logo to max 100x100 px
function resizeImage(file, callback) {
  const reader = new FileReader();
  const img = new Image();
  reader.onload = e => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 100, 100);
      ctx.drawImage(img, 0, 0, 100, 100);
      callback(canvas.toDataURL("image/png"));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Show loading bar, then run callback
function showProgress(callback) {
  progressBar.style.display = "block";
  progressBar.value = 0;
  let val = 0;
  const interval = setInterval(() => {
    val += 10;
    progressBar.value = val;
    if (val >= 100) {
      clearInterval(interval);
      progressBar.style.display = "none";
      callback();
    }
  }, 40);
}

// Generate QR Code
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
      dotsOptions: {
        color: colorPicker.value,
        type: "rounded"
      },
      image: uploadedLogo
    });

    qrContainer.innerHTML = "";
    qrCode.append(qrContainer);
  });
}

// Detect input content and show info
function detectContent(text) {
  if (/^https?:\/\//i.test(text)) {
    autoInfo.textContent = "🔗 Detected URL.";
  } else if (/^\d{9,}$/.test(text)) {
    autoInfo.innerHTML = `📞 Phone number detected.<br><a href="https://wa.me/${text}" target="_blank">Open WhatsApp</a>`;
  } else {
    autoInfo.textContent = "📝 Plain text.";
  }
}

// Save text to history (localStorage)
function saveToHistory(text) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  if (!history.includes(text)) {
    history.unshift(text);
    if (history.length > 10) history.pop();
    localStorage.setItem("qrHistory", JSON.stringify(history));
  }
  renderHistory();
}

// Render history list
function renderHistory() {
  const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.tabIndex = 0;
    li.addEventListener("click", () => {
      input.value = item;
      detectContent(item);
      generateQR();
    });
    li.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        input.value = item;
        detectContent(item);
        generateQR();
      }
    });
    historyList.appendChild(li);
  });
}

// Download QR PNG with custom name
function downloadQR() {
  qrCode.getRawData("png").then(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode | zyne.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

// ========== EVENT LISTENERS ==========

// Upload custom logo
logoUpload.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImage(file, dataUrl => {
    uploadedLogo = dataUrl;
    generateQR();
  });
});

// Use template logo
document.querySelectorAll(".template-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const logoKey = btn.getAttribute("data-logo");
    uploadedLogo = templates[logoKey];
    generateQR();
  });
});

// Slider update size
sizeSlider.addEventListener("input", () => {
  currentSize = parseInt(sizeSlider.value);
  sizeDisplay.textContent = `${currentSize}px`;
  if (input.value.trim()) {
    generateQR();
  }
});

// Recolor QR
colorPicker.addEventListener("input", () => {
  if (input.value.trim()) {
    generateQR();
  }
});

// Generate on button
generateBtn.addEventListener("click", generateQR);

// Realtime detect content
input.addEventListener("input", () => {
  const text = input.value.trim();
  detectContent(text);
});

// Download QR
downloadBtn.addEventListener("click", downloadQR);

// Toggle history
toggleHistory.addEventListener("click", () => {
  const hidden = historyContainer.style.display === "none";
  historyContainer.style.display = hidden ? "block" : "none";
  toggleHistory.textContent = hidden ? "📜 Hide History" : "📜 Show History";
  toggleHistory.setAttribute("aria-expanded", hidden);
});

// Toggle theme (dark/light)
themeToggle.addEventListener("click", () => {
  const icon = themeToggle.querySelector("i");
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";

  html.setAttribute("data-theme", isDark ? "light" : "dark");
  icon.classList.toggle("fa-moon", !isDark);
  icon.classList.toggle("fa-sun", isDark);
});

// Init page
document.addEventListener("DOMContentLoaded", () => {
  sizeDisplay.textContent = `${currentSize}px`;
  renderHistory();
  detectContent(input.value.trim());
});