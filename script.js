let currentLang = "en";
let users = 1, eligible = 0, notEligible = 0;

function changeLang(l) {
    currentLang = l;
}

function startVoice() {
    let r = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    r.lang = currentLang == "hi" ? "hi-IN" : currentLang == "gu" ? "gu-IN" : "en-US";
    r.start();

    r.onresult = e => {
        let t = e.results[0][0].transcript.toLowerCase();
        let n = t.match(/\d+/g);
        if (n) {
            age.value = n[0];
            if (n.length > 1) income.value = n.slice(1).join("");
        }
        checkScheme();
    }
}

async function checkScheme() {
    const res = await fetch("http://127.0.0.1:5000/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            age: age.value,
            income: income.value,
            lang: currentLang
        })
    });
    const d = await res.json();
    result.innerText = d.message;

    let u = new SpeechSynthesisUtterance(d.message);
    u.lang = currentLang == "hi" ? "hi-IN" : currentLang == "gu" ? "gu-IN" : "en-US";
    speechSynthesis.speak(u);

    users++;
    if (d.eligible) eligible++;
    else notEligible++;
}

// PDF download with all details
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();
    let line = 10;

    doc.setFontSize(12);
    doc.text(`Age: ${age.value}`, 10, line); line += 10;
    doc.text(`Income: ${income.value}`, 10, line); line += 10;
    doc.text(`Status: ${status.value}`, 10, line); line += 10;
    doc.text(`Scheme: ${result.innerText}`, 10, line); line += 10;

    // Find office links
    doc.text(`Find Office (Basic): https://www.google.com/maps/search/nearest+welfare+office`, 10, line); line += 10;
    
    // For Nearby office, if geolocation is available
    let lat = "LATITUDE";
    let lon = "LONGITUDE";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            let nearbyLink = `https://www.google.com/maps/search/welfare+office/@${lat},${lon},14z`;
            doc.text(`Find Office (Nearby): ${nearbyLink}`, 10, line); line += 10;
            addDocumentsAndAdmin(doc, line);
        }, () => {
            doc.text(`Find Office (Nearby): Permission denied`, 10, line); line += 10;
            addDocumentsAndAdmin(doc, line);
        });
    } else {
        doc.text(`Find Office (Nearby): Not supported`, 10, line); line += 10;
        addDocumentsAndAdmin(doc, line);
    }

    // If geolocation runs async, documents & admin are added there
    if (!navigator.geolocation) addDocumentsAndAdmin(doc, line);
}

function addDocumentsAndAdmin(doc, line) {
    // Uploaded documents
    let aadhaarFile = document.getElementById("aadhaarFile").files[0];
    let panFile = document.getElementById("panFile").files[0];
    doc.text(`Aadhaar Card: ${aadhaarFile ? aadhaarFile.name : "Not uploaded"}`, 10, line); line += 10;
    doc.text(`PAN Card: ${panFile ? panFile.name : "Not uploaded"}`, 10, line); line += 10;

    // Admin dashboard summary
    doc.text(`\n--- Admin Dashboard ---`, 10, line); line += 10;
    doc.text(`Total Users: ${users}`, 10, line); line += 10;
    doc.text(`Eligible: ${eligible}`, 10, line); line += 10;
    doc.text(`Not Eligible: ${notEligible}`, 10, line); line += 10;

    doc.save("LifeAid_Report.pdf");
}

// 1️⃣ First version of findOffice
function findOfficeBasic() {
    window.open("https://www.google.com/maps/search/nearest+welfare+office");
}

// 2️⃣ Second version of findOffice (with current location)
function findOfficeWithLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
            window.open(`https://www.google.com/maps/search/welfare+office/@${lat},${lon},14z`);
        }, err => {
            alert("Geolocation permission denied or not available.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function showAdmin() {
    admin.style.display = "block";
    users.innerText = users;
    eligible.innerText = eligible;
    notEligible.innerText = notEligible;
}
