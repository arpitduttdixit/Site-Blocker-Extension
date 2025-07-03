const urlInput = document.getElementById("url");
const addBtn = document.getElementById("add");
const listUl = document.getElementById("list");

let blocked = [];

async function init() {
  const result = await chrome.storage.sync.get("blocked");
  blocked = result.blocked || [];
  renderList();
}

function renderList() {
  listUl.innerHTML = "";
  blocked.forEach((pattern, idx) => {
    const li = document.createElement("li");
    li.textContent = pattern;

    const rm = document.createElement("button");
    rm.textContent = "✕";
    rm.addEventListener("click", () => removeAt(idx));

    li.appendChild(rm);
    listUl.appendChild(li);
  });
}

async function addPattern() {
  const pattern = urlInput.value.trim();
  if (!pattern) return;
  if (blocked.includes(pattern)) {
    alert("Already blocked.");
    return;
  }
  blocked.push(pattern);
  urlInput.value = "";
  await pushUpdate();
}

async function removeAt(i) {
  blocked.splice(i, 1);
  await pushUpdate();
}

async function pushUpdate() {
  await chrome.runtime.sendMessage({
    type: "updateBlockList",
    payload: blocked,
  });
  renderList();
}

addBtn.addEventListener("click", addPattern);
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addPattern();
});

init();
