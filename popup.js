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
const quickAddInput = document.getElementById("quick-add-input");
const quickAddBtn = document.getElementById("quick-add-btn");

/**************************
 * 3. State               *
 **************************/
let blocked = []; // current block list, now stores objects {pattern, blockUntil}
let userAdds = []; // user-defined quick-adds (label+pattern)

/**************************
 * 4. Initialise          *
 **************************/
async function init() {
  const { blocked: b = [], quickAdds = [] } = await chrome.storage.sync.get([
    "blocked",
    "quickAdds",
  ]);
  // Ensure blocked items are objects with pattern and blockUntil,
  // and filter out any expired items if the extension was closed
  blocked = b
    .map((item) =>
      typeof item === "string" ? { pattern: item, blockUntil: 0 } : item
    )
    .filter((item) => item.blockUntil === 0 || item.blockUntil > Date.now());

  userAdds = quickAdds;
  renderQuickAdds();
  renderList();
  // Set up an interval to check for expired URLs every minute
  setInterval(checkExpiredUrls, 60 * 1000);
}

// Function to check and remove expired URLs
async function checkExpiredUrls() {
  const now = Date.now();
  const initialBlockedCount = blocked.length;
  blocked = blocked.filter(
    (item) => item.blockUntil === 0 || item.blockUntil > now
  );

  if (blocked.length < initialBlockedCount) {
    await pushUpdate();
  }
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
  blocked.forEach((item, idx) => {
    const li = document.createElement("li");
    li.textContent = item.pattern; // Display the pattern

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "controls";

    const expirySelect = document.createElement("select");
    expirySelect.innerHTML = `
      <option value="0">Set expiry</option>
      <option value="2">2 min</option>
      <option value="15">15 min</option>
      <option value="30">30 min</option>
      <option value="45">45 min</option>
      <option value="60">1 hour</option>
      <option value="120">2 hours</option>
      <option value="300">5 hours</option>
    `;
    // Set the selected value if an expiry duration was previously set
    const durationInMinutes =
      item.blockUntil > 0
        ? Math.round((item.blockUntil - Date.now()) / (60 * 1000))
        : 0;
    // Find the closest option value for display
    const closestOption = [0, 2, 15, 30, 45, 60, 120, 300].reduce(
      (prev, curr) =>
        Math.abs(curr - durationInMinutes) < Math.abs(prev - durationInMinutes)
          ? curr
          : prev
    );
    expirySelect.value = closestOption.toString();

    expirySelect.addEventListener("change", (e) =>
      setExpiry(idx, parseInt(e.target.value))
    );

    const rm = document.createElement("button");
    rm.textContent = "✕";
    rm.addEventListener("click", () => removeAt(idx));

    controlsDiv.appendChild(expirySelect);
    controlsDiv.appendChild(rm);
    li.appendChild(controlsDiv);
    listUl.appendChild(li);
  });
}

/**************************
 * 6. Block-list actions  *
 **************************/
async function addPattern(raw) {
  const pattern = (raw ?? urlInput.value).trim();
  if (!pattern) return;
  if (blocked.some((item) => item.pattern === pattern)) {
    alert("Already blocked.");
    return;
  }
  // Add new pattern with no expiry by default
  blocked.push({ pattern: pattern, blockUntil: 0 });
  urlInput.value = "";
  await pushUpdate();
}

async function addQuickAdd() {
  const pattern = quickAddInput.value.trim();
  if (!pattern) return;
  if (userAdds.some((qa) => qa.pattern === pattern)) {
    alert("Already exists in quick-adds.");
    return;
  }
  await addUserQuickAdd(quickAddInput.value, pattern);
  quickAddInput.value = "";
}

async function removeAt(i) {
  blocked.splice(i, 1);
  await pushUpdate();
}

/**
 * Sets the expiry for a blocked URL.
 * @param {number} idx The index of the URL in the blocked array.
 * @param {number} durationInMinutes The duration in minutes for which the URL should be blocked. 0 means no expiry.
 */
async function setExpiry(idx, durationInMinutes) {
  if (idx < 0 || idx >= blocked.length) return;

  const now = Date.now();
  const blockUntil =
    durationInMinutes === 0 ? 0 : now + durationInMinutes * 60 * 1000;

  blocked[idx].blockUntil = blockUntil;
  await pushUpdate();
}

async function pushUpdate() {
  await chrome.runtime.sendMessage({
    type: "updateBlockList",
    // Send only patterns to background.js for rule creation
    payload: blocked
      .filter((item) => item.blockUntil === 0 || item.blockUntil > Date.now())
      .map((item) => item.pattern),
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

quickAddBtn.addEventListener("click", () => addQuickAdd());

init();
