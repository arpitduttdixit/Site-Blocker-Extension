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
 * 1b. Productive URLs    *
 **************************/
const productiveUrls = [
  {
    label: "Motivational Quote 1",
    url: "https://i.pinimg.com/736x/b3/5c/4e/b35c4e9f29c4de13254bcf7b2a9f8c1e.jpg",
  },
  {
    label: "Study Tips",
    url: "https://i.pinimg.com/736x/fe/47/10/fe471063853233846efdebd8b203715e.jpg",
  },
  {
    label: "Productivity Quote",
    url: "https://i.pinimg.com/736x/cd/bf/da/cdbfda3fd32e9852adb21b1b3c063af9.jpg",
  },
  {
    label: "Success Mindset",
    url: "https://i.pinimg.com/1200x/18/0b/ab/180babca3da124d26e553878f34e15f3.jpg",
  },
  {
    label: "Focus Quote",
    url: "https://i.pinimg.com/736x/05/af/7a/05af7aff69e4c59d01b1c355f24d7f0a.jpg",
  },
  {
    label: "Goal Setting",
    url: "https://i.pinimg.com/736x/11/b1/eb/11b1eb945c94092498d92231772a3da7.jpg",
  },
  {
    label: "Time Management",
    url: "https://i.pinimg.com/1200x/a2/b9/61/a2b9613ac07d6c04001e6ef539a047e5.jpg",
  },
  {
    label: "Self Improvement",
    url: "https://i.pinimg.com/736x/c6/b9/79/c6b979e254461b7faf0f1d0694096b0d.jpg",
  },
  {
    label: "Discipline Quote",
    url: "https://i.pinimg.com/1200x/96/88/95/96889550725bef51aaa7bc0371ca199f.jpg",
  },
  {
    label: "Growth Mindset",
    url: "https://i.pinimg.com/736x/0c/a5/ca/0ca5ca4c6e2703c233b3e3d816ae6389.jpg",
  },
  {
    label: "Success Habits",
    url: "https://i.pinimg.com/1200x/dc/c5/96/dcc5963e5973a438aaf5ac2eb77ba3cc.jpg",
  },
];

/**************************
 * 2. DOM handles         *
 **************************/
const urlInput = document.getElementById("url");
const actionSelect = document.getElementById("action-select");
const redirectUrlInput = document.getElementById("redirect-url");
const redirectUrlContainer = document.getElementById("redirect-url-container");
<<<<<<< HEAD
const productiveUrlsBtn = document.getElementById("productive-urls-btn");

=======
>>>>>>> main
const addBtn = document.getElementById("add");
const listUl = document.getElementById("list");
const quickAddDiv = document.getElementById("quick-adds");
const quickAddInput = document.getElementById("quick-add-input");
const quickAddBtn = document.getElementById("quick-add-btn");

/**************************
 * 3. State               *
 **************************/
let blocked = []; // current block list, now stores objects {pattern, blockUntil, action, redirectUrl}
let userAdds = []; // user-defined quick-adds (label+pattern)

/**************************
 * 4. Initialise          *
 **************************/
async function init() {
  const { blocked: b = [], quickAdds = [] } = await chrome.storage.sync.get([
    "blocked",
    "quickAdds",
  ]);
  // Ensure blocked items are objects with pattern, blockUntil, action, and redirectUrl,
  // and filter out any expired items if the extension was closed
  blocked = b
    .map((item) => {
      if (typeof item === "string") {
        return {
          pattern: item,
          blockUntil: 0,
          action: "block",
          redirectUrl: "",
        };
      }
      // Ensure existing objects have the new properties
      return {
        pattern: item.pattern,
        blockUntil: item.blockUntil || 0,
        action: item.action || "block",
        redirectUrl: item.redirectUrl || "",
      };
    })
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
    btn.addEventListener("click", () => addPattern(qa.pattern, "block", ""));
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

    // Create pattern display with action type
    const patternDiv = document.createElement("div");
    patternDiv.style.flex = "1";

    const patternText = document.createElement("div");
    patternText.textContent = item.pattern;
    patternText.style.fontWeight = "bold";

    const actionText = document.createElement("div");
    actionText.style.fontSize = "11px";
    actionText.style.color = "#666";
    actionText.style.textTransform = "uppercase";
    actionText.style.marginTop = "4px";

    if (item.action === "redirect") {
<<<<<<< HEAD
      // Truncate long URLs to prevent layout overflow
      const truncatedUrl =
        item.redirectUrl.length > 25
          ? item.redirectUrl.substring(0, 22) + "..."
          : item.redirectUrl;
      actionText.innerHTML = `<strong>REDIRECT</strong> → ${truncatedUrl}`;
      actionText.style.color = "#0066cc";
      actionText.title = item.redirectUrl; // Show full URL on hover
=======
      actionText.innerHTML = `<strong>REDIRECT</strong> → ${item.redirectUrl}`;
      actionText.style.color = "#cc0000";
>>>>>>> main
    } else {
      actionText.innerHTML = "<strong>BLOCK</strong>";
      actionText.style.color = "#cc0000";
    }

    patternDiv.appendChild(patternText);
    patternDiv.appendChild(actionText);
    li.appendChild(patternDiv);

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
    const initialOptionValue =
      item.blockUntil > 0
        ? [0, 1, 2, 15, 30, 45, 60, 120, 300]
            .reduce((prev, curr) => {
              const prevDiff = Math.abs(
                item.blockUntil - (Date.now() + prev * 60 * 1000)
              );
              const currDiff = Math.abs(
                item.blockUntil - (Date.now() + curr * 60 * 1000)
              );
              return currDiff < prevDiff ? curr : prev;
            }, 0)
            .toString()
        : "0";

    expirySelect.value = initialOptionValue;

    const updateDisplay = () => {
      const display = formatRemainingTime(item.blockUntil);
      if (display === "Expired") {
        clearInterval(intervalId);
        renderList(); // Re-render to remove expired item
      } else {
        // Find the currently selected option and update its text content
        const selectedOption = expirySelect.querySelector(
          `option[value="${expirySelect.value}"]`
        );
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
      const originalOption = expirySelect.querySelector(
        `option[value="${expirySelect.value}"]`
      );
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
        ].find((opt) => opt.value.toString() === expirySelect.value);
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
async function addPattern(raw, action = null, redirectUrl = null) {
  const pattern = (raw ?? urlInput.value).trim();
  const selectedAction = action ?? actionSelect.value;
  let selectedRedirectUrl = redirectUrl ?? redirectUrlInput.value.trim();

  if (!pattern) {
    alert("URL pattern is required.");
    return;
  }

  if (blocked.some((item) => item.pattern === pattern)) {
    alert("This URL pattern already exists in the list.");
    return;
  }

  // Validate redirect URL if action is redirect
  if (selectedAction === "redirect") {
<<<<<<< HEAD
=======
    console.log("Validating redirect URL:", selectedRedirectUrl);

>>>>>>> main
    if (!selectedRedirectUrl) {
      alert("Redirect URL is required for redirect action.");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> main
    // Simple validation - just check it's not empty and normalize it
    let validatedRedirectUrl = selectedRedirectUrl;

    // Add protocol if missing and it looks like a domain
    if (
      !selectedRedirectUrl.startsWith("http://") &&
      !selectedRedirectUrl.startsWith("https://")
    ) {
<<<<<<< HEAD
=======
      console.log("Adding https:// to redirect URL");
>>>>>>> main
      // If it contains a dot or is a simple word, treat as domain and add https://
      if (
        selectedRedirectUrl.includes(".") ||
        !selectedRedirectUrl.includes("/")
      ) {
        validatedRedirectUrl = "https://" + selectedRedirectUrl;
      } else {
        // If it starts with / or contains /, assume it's a path and add https://
        validatedRedirectUrl = "https://" + selectedRedirectUrl;
      }
    }

    selectedRedirectUrl = validatedRedirectUrl;
  }

  // Add new pattern with no expiry by default
  blocked.push({
    pattern: pattern,
    blockUntil: 0,
    action: selectedAction,
    redirectUrl: selectedAction === "redirect" ? selectedRedirectUrl : "",
  });

  // Clear inputs
  urlInput.value = "";
  redirectUrlInput.value = "";
  actionSelect.value = "block";
  redirectUrlContainer.style.display = "none";
<<<<<<< HEAD
  productiveUrlsBtn.style.display = "none";
=======
>>>>>>> main

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
  const activeRules = blocked.filter(
    (item) => item.blockUntil === 0 || item.blockUntil > Date.now()
  );

  await chrome.runtime.sendMessage({
    type: "updateBlockList",
    // Send full rule objects to background.js for rule creation
    payload: activeRules,
  });
  console.log("Rules updated:", blocked);
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
// Handle action selection change
actionSelect.addEventListener("change", () => {
  if (actionSelect.value === "redirect") {
    redirectUrlContainer.style.display = "flex";
<<<<<<< HEAD
    productiveUrlsBtn.style.display = "inline-block";
  } else {
    redirectUrlContainer.style.display = "none";
    redirectUrlInput.value = "";
    productiveUrlsBtn.style.display = "none";
  }
});

// Handle productive URLs button click - randomly select a productive URL
productiveUrlsBtn.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * productiveUrls.length);
  const randomUrl = productiveUrls[randomIndex];
  redirectUrlInput.value = randomUrl.url;

  // Optional: Show a brief visual feedback
  productiveUrlsBtn.textContent = "✓";
  setTimeout(() => {
    productiveUrlsBtn.textContent = "**";
  }, 1000);
});

// Handle add button click
addBtn.addEventListener("click", () => addPattern());

=======
  } else {
    redirectUrlContainer.style.display = "none";
    redirectUrlInput.value = "";
  }
});

// Handle add button click
addBtn.addEventListener("click", () => {
  addPattern();
});

>>>>>>> main
// Handle enter key in URL input
urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addPattern();
  }
});

// Handle enter key in redirect URL input
redirectUrlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addPattern();
  }
});

// Handle enter key in redirect URL input
redirectUrlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addPattern();
});

quickAddBtn.addEventListener("click", () => addQuickAdd());

init();
