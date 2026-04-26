function checkString() {
  const input = document.getElementById("inputString").value;
  const historyBox = document.getElementById("historyBox");
  const resultBox = document.getElementById("resultBox");

  historyBox.innerHTML = "";

  let state = "S";
  let invalidReason = "";

  for (let i = 0; i < input.length; i++) {
    let char = input[i];
    let prevState = state;

    if (char !== '0' && char !== '1') {
      invalidReason = `Karakter '${char}' tidak valid`;
      addHistory(`❌ ${invalidReason}`);
      resultBox.innerHTML = "INVALID";
      resultBox.style.color = "red";
      return;
    }

    switch(state) {
      case "S":
        state = (char === '0') ? "A" : "B";
        break;
      case "A":
        state = (char === '0') ? "C" : "B";
        break;
      case "B":
        state = (char === '0') ? "A" : "B";
        break;
      case "C":
        state = "C";
        break;
    }

    addHistory(`${char} : ${prevState} → ${state}`);

    if (state === "C") {
      invalidReason = `Substring "00" ditemukan pada langkah ke-${i+1}`;
    }
  }

  if (state === "B") {
    resultBox.innerHTML = "VALID";
    resultBox.style.color = "green";
    addHistory("✅ String diterima karena berakhir di state B");
  } else {
    resultBox.innerHTML = "INVALID";
    resultBox.style.color = "red";

    if (invalidReason === "") {
      invalidReason = "String tidak berakhir dengan 1";
    }

    addHistory(`❌ ${invalidReason}`);
  }

  function addHistory(text) {
    let div = document.createElement("div");
    div.className = "history-item";
    div.innerText = text;
    historyBox.appendChild(div);
  }
}

function resetAll() {
  document.getElementById("inputString").value = "";
  document.getElementById("historyBox").innerHTML = "";
  document.getElementById("resultBox").innerHTML = "Menunggu input...";
  document.getElementById("resultBox").style.color = "black";
}