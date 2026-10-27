let currentStep = 0;
const totalSteps = 6;

const walkStage = document.getElementById("walkStage");
const formStage = document.getElementById("formStage");
const endStage = document.getElementById("endStage");

const builderChar = document.getElementById("builderChar");
const speechBubble = document.getElementById("speechBubble");
const btnStep = document.getElementById("btnStep");
const progressForm = document.getElementById("progressForm");
const btnReset = document.getElementById("btnReset");

const studentClassSelect = document.getElementById("studentClass");
const linkFieldLabel = document.getElementById("linkFieldLabel");
const projectLinkInput = document.getElementById("projectLink");
const linkHelpText = document.getElementById("linkHelpText");
const fileFieldLabel = document.getElementById("fileFieldLabel");
const fileHelpText = document.getElementById("fileHelpText");
const projectFileInput = document.getElementById("projectFile");
const filePreview = document.getElementById("filePreview");

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbytB5KUcDXXX_usI5BrybNVu8JVdWI-aavP50hMsk52XexhobR2HQSHUAS6LO9BzaSu/exec";

function moveForward() {
  if (currentStep < totalSteps) {
    currentStep++;

    const startLeft = 50;
    const maxWalkDistance = window.innerWidth - 180;
    const stepDistance = (maxWalkDistance - startLeft) / totalSteps;
    const newLeft = startLeft + stepDistance * currentStep;

    builderChar.style.left = `${newLeft}px`;
    builderChar.classList.add("walking");

    setTimeout(() => {
      builderChar.classList.remove("walking");
    }, 300);

    if (currentStep === 1) speechBubble.innerText = "Yuk jalan lagi!";
    if (currentStep === 3) speechBubble.innerText = "Sudah setengah jalan!";
    if (currentStep === 5) speechBubble.innerText = "Satu langkah lagi nyampe!";

    if (currentStep >= totalSteps) {
      speechBubble.innerText = "Sampai! Membuka pintu...";
      setTimeout(() => {
        walkStage.classList.remove("active");
        formStage.classList.add("active");
      }, 800);
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && walkStage.classList.contains("active")) {
    e.preventDefault();
    moveForward();
  }
});

btnStep.addEventListener("click", () => {
  if (walkStage.classList.contains("active")) {
    moveForward();
  }
});

studentClassSelect.addEventListener("change", () => {
  const selectedClass = studentClassSelect.value;

  if (selectedClass.startsWith("8") || selectedClass.startsWith("9")) {
    linkFieldLabel.innerHTML =
      'Link Proyek App Inventor <span style="color:red">*Wajib</span>';
    projectLinkInput.required = true;
    projectLinkInput.placeholder = "https://gallery.appinventor.mit.edu/...";
    linkHelpText.innerText = "Wajib menyertakan link project App Inventor.";

    fileFieldLabel.innerText = "Upload Screenshot Progres App Inventor";
    fileHelpText.innerText =
      "Upload screenshot blok kode atau tampilan emulator.";
  } else if (selectedClass.startsWith("7")) {
    linkFieldLabel.innerText = "Link Proyek (Opsional)";
    projectLinkInput.required = false;
    projectLinkInput.placeholder = "https://... (Kosongkan jika offline)";
    linkHelpText.innerText = "Opsional untuk Web Offline.";

    fileFieldLabel.innerHTML =
      'Upload Screenshot Web <span style="color:red">*Wajib 2 Gambar</span>';
    fileHelpText.innerText =
      "Wajib upload 2 gambar: 1) Tampilan Web di Browser, 2) Screenshot Kode HTML & CSS.";
  }
});

projectFileInput.addEventListener("change", (e) => {
  filePreview.innerHTML = "";
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = document.createElement("img");
      img.src = evt.target.result;
      filePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

progressForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedClass = studentClassSelect.value;
  const files = projectFileInput.files;

  if (selectedClass.startsWith("7") && files.length < 2) {
    alert(
      "Untuk Kelas 7, mohon upload minimal 2 screenshot:\n1. Tampilan Web di Browser\n2. Tampilan Kode HTML & CSS",
    );
    return;
  }

  const submitBtn = progressForm.querySelector(".btn-submit");
  submitBtn.innerText = "Memproses & Mengirim Foto...";
  submitBtn.disabled = true;

  // Membaca file gambar dan mengonversi ke Base64
  const filePromises = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({
          base64: base64,
          mimeType: file.type,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  try {
    const fileDataList = await Promise.all(filePromises);

    const formData = {
      name: document.getElementById("studentName").value,
      studentClass: selectedClass,
      projectTitle: document.getElementById("projectTitle").value,
      projectLink: projectLinkInput.value || "-",
      files: fileDataList,
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    submitBtn.innerText = "Kirim Laporan";
    submitBtn.disabled = false;

    formStage.classList.remove("active");
    endStage.classList.add("active");
  } catch (err) {
    alert(
      "Gagal mengirim laporan. Coba pastikan koneksi internet stabil lalu coba lagi ya!",
    );
    submitBtn.innerText = "Kirim Laporan";
    submitBtn.disabled = false;
  }
});

btnReset.addEventListener("click", () => {
  currentStep = 0;
  builderChar.style.left = "50px";
  speechBubble.innerText = "Ayo maju ke pintu!";
  progressForm.reset();
  filePreview.innerHTML = "";
  linkHelpText.innerText = "Pilih kelas terlebih dahulu.";

  endStage.classList.remove("active");
  walkStage.classList.add("active");
});
