// Increment this if you ever wipe ALL rules so ids don’t collide
const RULE_ID_START = 1000;

/**
 * Turn an array of strings into DynamicRules (1 per string).
 * @param {string[]} patterns
 */
function patternsToRules(patterns) {
  return patterns.map((pattern, idx) => ({
    id: RULE_ID_START + idx,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: pattern,
      resourceTypes: ["main_frame", "sub_frame"],
    },
  }));
}

/** Load list from storage, build rules on startup */
chrome.runtime.onInstalled.addListener(async () => {
  const { blocked = [] } = await chrome.storage.sync.get("blocked");
  await refreshRules(blocked);
});

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
