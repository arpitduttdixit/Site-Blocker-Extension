// Increment this if you ever wipe ALL rules so ids don’t collide
const RULE_ID_START = 1000;

// let currentInterval = null; // To store the interval ID

/**
 * Turn an array of rule objects into DynamicRules.
 * @param {Array} rules - Array of objects with {pattern, action, redirectUrl}
 */
function rulesToDynamicRules(rules) {
  return rules.map((rule, idx) => {
    const urlFilter = normalize(rule.pattern.trim());
    const dynamicRule = {
      id: RULE_ID_START + idx,
      priority: 1,
      condition: {
        urlFilter,
        resourceTypes: ["main_frame", "sub_frame"], // covers top-level nav + iframes
      },
    };

    if (rule.action === "redirect") {
      dynamicRule.action = {
        type: "redirect",
        redirect: { url: rule.redirectUrl },
      };
    } else {
      dynamicRule.action = { type: "block" };
    }

    return dynamicRule;
  });
}

/** Load list from storage, build rules on startup */
chrome.runtime.onInstalled.addListener(async () => {
  await initBackground();
});

/** Load list from storage, build rules on startup */
chrome.runtime.onStartup.addListener(async () => {
  await initBackground();
});

/**
 * Naïve “smart” conversion:
 *  - If the string looks like a bare domain, wrap it with *://*.  … /*
 *  - Otherwise leave it unchanged (supports advanced URL-filter syntax)
 */
function normalize(pattern) {
  // Matches something like example.com or sub.domain.co.uk
  const domainRegex = /^[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (domainRegex.test(pattern)) {
    return `*://*.${pattern.replace(/^www\./, "")}/*`;
  }
  return pattern;
}

/**
 * Replace ALL dynamic rules with rules matching given rule objects.
 * @param {Array} rules - Array of objects with {pattern, action, redirectUrl}
 */
async function refreshRules(rules) {
  const allRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = allRules.map((r) => r.id);
  const addRules = rulesToDynamicRules(rules);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules,
  });
}

// Function to check and remove expired URLs
async function checkExpiredUrls() {
  const { blocked: b = [] } = await chrome.storage.sync.get("blocked");
  let blocked = b.map((item) => {
    if (typeof item === "string") {
      return { pattern: item, blockUntil: 0, action: "block", redirectUrl: "" };
    }
    return {
      pattern: item.pattern,
      blockUntil: item.blockUntil || 0,
      action: item.action || "block",
      redirectUrl: item.redirectUrl || "",
    };
  });

  const now = Date.now();
  const initialBlockedCount = blocked.length;
  blocked = blocked.filter(
    (item) => item.blockUntil === 0 || item.blockUntil > now
  );

  if (blocked.length < initialBlockedCount) {
    await chrome.storage.sync.set({ blocked });
    await refreshRules(blocked);
  }
}

async function initBackground() {
  const { blocked = [] } = await chrome.storage.sync.get("blocked");
  const activeRules = blocked
    .map((item) => {
      if (typeof item === "string") {
        return {
          pattern: item,
          blockUntil: 0,
          action: "block",
          redirectUrl: "",
        };
      }
      return {
        pattern: item.pattern,
        blockUntil: item.blockUntil || 0,
        action: item.action || "block",
        redirectUrl: item.redirectUrl || "",
      };
    })
    .filter((item) => item.blockUntil === 0 || item.blockUntil > Date.now());
  await refreshRules(activeRules);

  setInterval(checkExpiredUrls, 60 * 1000); // Check every minute
}

/** Listen for messages from the popup to update list */
chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg.type === "updateBlockList") {
    await refreshRules(msg.payload);
    sendResponse({ status: "ok" });
  }
  // keep message channel open
  return true;
});
