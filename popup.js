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
      <option value="1">1 min</option>
      <option value="2">2 min</option>
      <option value="15">15 min</option>
      <option value="30">30 min</option>
      <option value="45">45 min</option>
      <option value="60">1 hour</option>
      <option value="120">2 hours</option>
      <option value="300">5 hours</option>
    `;
    // Set the selected value if an expiry duration was previously set
    // Function to format remaining time
    function formatRemainingTime(blockUntil) {
      if (blockUntil === 0) {
        return "Permanent";
      }
      const remainingMs = blockUntil - Date.now();
      if (remainingMs <= 0) {
        return "Expired";
      }
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      if (remainingMinutes < 60) {
        return `${remainingMinutes} min`;
      }
      const remainingHours = Math.floor(remainingMinutes / 60);
      const remainingMinutesRemainder = remainingMinutes % 60;
      if (remainingMinutesRemainder === 0) {
        return `${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
      }
      return `${remainingHours}h ${remainingMinutesRemainder}m`;
    }

    expirySelect.innerHTML = `
      <option value="0">Permanent</option>
      <option value="1">1 min</option>
      <option value="2">2 min</option>
      <option value="15">15 min</option>
      <option value="30">30 min</option>
      <option value="45">45 min</option>
      <option value="60">1 hour</option>
      <option value="120">2 hours</option>
      <option value="300">5 hours</option>
    `;

    // Set the selected value based on blockUntil and display remaining time
    const initialOptionValue = item.blockUntil > 0 ? 
      [0, 1, 2, 15, 30, 45, 60, 120, 300].reduce((prev, curr) => {
        const prevDiff = Math.abs(item.blockUntil - (Date.now() + prev * 60 * 1000));
        const currDiff = Math.abs(item.blockUntil - (Date.now() + curr * 60 * 1000));
        return currDiff < prevDiff ? curr : prev;
      }, 0).toString() : '0';
      
    expirySelect.value = initialOptionValue;

    const updateDisplay = () => {
      const display = formatRemainingTime(item.blockUntil);
      if (display === "Expired") {
        clearInterval(intervalId);
        renderList(); // Re-render to remove expired item
      } else {
        // Find the currently selected option and update its text content
        const selectedOption = expirySelect.querySelector(`option[value="${expirySelect.value}"]`);
        if (selectedOption) {
          selectedOption.textContent = display;
        }
      }
    };

    // Initial display update
    updateDisplay();

    // Update remaining time every second if not permanent
    let intervalId;
    if (item.blockUntil > 0) {
      intervalId = setInterval(updateDisplay, 1000);
    }

    // When the dropdown is opened, reset text to its original option label
    // and then re-apply the timer if an expiry is set
    expirySelect.addEventListener("focus", () => {
      const originalOption = expirySelect.querySelector(`option[value="${expirySelect.value}"]`);
      if (originalOption) {
        // Reset to original label for fixed durations
        const fixedDurationOption = [
          { value: 0, label: "Permanent" },
          { value: 1, label: "1 min" },
          { value: 2, label: "2 min" },
          { value: 15, label: "15 min" },
          { value: 30, label: "30 min" },
          { value: 45, label: "45 min" },
          { value: 60, label: "1 hour" },
          { value: 120, label: "2 hours" },
          { value: 300, label: "5 hours" },
        ].find(opt => opt.value.toString() === expirySelect.value);
        if (fixedDurationOption) {
          originalOption.textContent = fixedDurationOption.label;
        }
      }
      // Clear existing interval if any, and restart if expiry is set
      if (intervalId) clearInterval(intervalId);
    });

    expirySelect.addEventListener("blur", () => {
      // Restart the countdown when dropdown is closed
      if (item.blockUntil > 0) {
        intervalId = setInterval(updateDisplay, 1000);
        updateDisplay(); // Immediate update on blur
      }
    });

    // Also handle change event if user selects a new value
    expirySelect.addEventListener("change", (e) => {
      setExpiry(idx, parseInt(e.target.value));
      // Clear existing interval if any, and restart after setting new expiry
      if (intervalId) clearInterval(intervalId);
      if (blocked[idx].blockUntil > 0) {
        intervalId = setInterval(updateDisplay, 1000);
      }
      updateDisplay(); // Immediate update after change
    });


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
  console.log("Block list updated:", blocked);
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
