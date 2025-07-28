/**************************
 * 1. Static quick-adds   *
 **************************/
const builtinQuickAdds = [
  { label: "YouTube", pattern: "*://*.youtube.com/*" },
  { label: "Reddit", pattern: "*://*.reddit.com/*" },
  { label: "Twitter", pattern: "*://*.twitter.com/*" },
  { label: "Instagram", pattern: "*://*.instagram.com/*" },
];

/**************************
 * 2. DOM handles         *
 **************************/
const urlInput = document.getElementById("url");
const addBtn = document.getElementById("add");
const listUl = document.getElementById("list");
const quickAddDiv = document.getElementById("quick-adds");

/**************************
 * 3. State               *
 **************************/
let blocked = []; // current block list
let userAdds = ["asdf"]; // user-defined quick-adds (label+pattern)

/**************************
 * 4. Initialise          *
 **************************/
async function init() {
  const { blocked: b = [], quickAdds = [] } = await chrome.storage.sync.get([
    "blocked",
    "quickAdds",
  ]);
  blocked = b;
  userAdds = quickAdds;
  renderQuickAdds();
  renderList();
}

/**************************
 * 5. Rendering helpers   *
 **************************/
function renderQuickAdds() {
  quickAddDiv.innerHTML = "";
  [...builtinQuickAdds, ...userAdds].forEach((qa, idx) => {
    const btn = document.createElement("button");
    btn.textContent = qa.label;
    btn.className = "qa-btn";
    btn.addEventListener("click", () => addPattern(qa.pattern));
    quickAddDiv.appendChild(btn);

    // allow deletion only for user-added shortcuts
    if (idx >= builtinQuickAdds.length) {
      const rm = document.createElement("span");
      rm.textContent = " ✕";
      rm.style.cursor = "pointer";
      rm.addEventListener("click", (e) => {
        e.stopPropagation();
        removeUserQuickAdd(idx - builtinQuickAdds.length);
      });
      btn.appendChild(rm);
    }
  });
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

/**************************
 * 6. Block-list actions  *
 **************************/
async function addPattern(raw) {
  const pattern = (raw ?? urlInput.value).trim();
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
  await chrome.storage.sync.set({ blocked });
  renderList();
}

/**************************
 * 7. Quick-add CRUD      *
 **************************/
async function addUserQuickAdd(label, pattern) {
  userAdds.push({ label, pattern });
  await chrome.storage.sync.set({ quickAdds: userAdds });
  renderQuickAdds();
}

async function removeUserQuickAdd(i) {
  userAdds.splice(i, 1);
  await chrome.storage.sync.set({ quickAdds: userAdds });
  renderQuickAdds();
}

/**************************
 * 8. Event wiring        *
 **************************/
addBtn.addEventListener("click", () => addPattern());
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addPattern();
});

init();
