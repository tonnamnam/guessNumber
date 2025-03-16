let currentAttempts = 0;
let maxAttempts = 0;

async function startGame() {
    let difficulty = document.getElementById("difficulty").value;
    let response = await fetch("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: difficulty })
    });

    let data = await response.json();
    document.getElementById("status").innerText = "เกมเริ่มต้นแล้ว! ทายตัวเลขระหว่าง " +
        data.range[0] + " ถึง " + data.range[1];

    document.getElementById("min-range").innerText = data.range[0];
    document.getElementById("max-range").innerText = data.range[1];
    document.getElementById("game-controls").style.display = "block";

    // สร้างจำนวนครั้ง
    maxAttempts = data.attempts;
    currentAttempts = maxAttempts;
    updateAttemptsDisplay();

    // รีเซ็ตค่า input
    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").focus();
}

async function makeGuess() {
    let guessInput = document.getElementById("guessInput");
    let guess = parseInt(guessInput.value);

    if (isNaN(guess)) {
        alert("กรุณาใส่ตัวเลข");
        return;
    }

    let response = await fetch("/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: guess })
    });

    let data = await response.json();

    if (data.error) {
        document.getElementById("status").innerText = data.error;
        return;
    }

    document.getElementById("status").innerText = data.message;

    // อัพเดทตัวเลข
    if (data.range) {
        document.getElementById("min-range").innerText = data.range[0];
        document.getElementById("max-range").innerText = data.range[1];
        currentAttempts = data.attempts_left;
        updateAttemptsDisplay();
    } else {
        // เกมจบแล้ว
        document.getElementById("game-controls").style.display = "none";
    }

    // รีเซ็ตค่า input
    guessInput.value = "";
    guessInput.focus();
}

function updateAttemptsDisplay() {
    const container = document.getElementById("attempts-container");
    container.innerHTML = "";

    for (let i = 0; i < maxAttempts; i++) {
        const indicator = document.createElement("div");
        indicator.className = "attempt-indicator";
        if (i >= currentAttempts) {
            indicator.classList.add("attempt-used");
        }
        container.appendChild(indicator);
    }
}

// จัดการการกด Enter ในช่อง input
document.getElementById("guessInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        makeGuess();
    }
});