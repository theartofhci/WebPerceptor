(async function () {
  if (window.top !== window) return; // skip iframes

  const url = window.top.location.href.toLowerCase();
  
  const { xTwitterContentFlag } = await new Promise(resolve => {
    chrome.storage.sync.get("xTwitterContentFlag", resolve);
  });

  const { modeSelect } = await new Promise(resolve => {
    chrome.storage.sync.get("modeSelect", resolve);
  });

  if (modeSelect === "none") {
    return;
  }

  const { appendMode } = await new Promise(resolve => {
    chrome.storage.sync.get("appendMode", resolve);
  });

  if (modeSelect === "append" && appendMode === "appendNone") {
    return;
  }

  if (url.includes("x.com") && xTwitterContentFlag) {
    const { runXTwitter } = await import(chrome.runtime.getURL('/contents/xTwitterContent.js'));
    await runXTwitter();
  } else {
    const { runGeneric } = await import(chrome.runtime.getURL('/contents/generalContent.js'));
    await runGeneric();
  }
})();
