// Increment this if you ever wipe ALL rules so ids don’t collide
const RULE_ID_START = 1000;

/**
 * Turn an array of strings into DynamicRules (1 per string).
 * @param {string[]} patterns
 */
function patternsToRules(patterns) {
  return patterns.map((raw, idx) => {
    const urlFilter = normalize(raw.trim());
    return {
      id: RULE_ID_START + idx,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter,
        resourceTypes: ["main_frame", "sub_frame"], // covers top-level nav + iframes
      },
    };
  });
}

/** Load list from storage, build rules on startup */
chrome.runtime.onInstalled.addListener(async () => {
  const { blocked = [] } = await chrome.storage.sync.get("blocked");
  await refreshRules(blocked);
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
 * Replace ALL dynamic rules with rules matching given patterns.
 * @param {string[]} patterns
 */
async function refreshRules(patterns) {
  const allRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = allRules.map((r) => r.id);
  const addRules = patternsToRules(patterns);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules,
  });
}

/** Listen for messages from the popup to update list */
chrome.runtime.onMessage.addListener(async (msg, _sender, sendResponse) => {
  if (msg.type === "updateBlockList") {
    await chrome.storage.sync.set({ blocked: msg.payload });
    await refreshRules(msg.payload);
    sendResponse({ status: "ok" });
  }
  // keep message channel open
  return true;
});
