(async function () {
  if (window.top !== window) return; // skip iframes

  const url = window.top.location.href.toLowerCase();
  
  const { xTwitterContentFlag } = await new Promise(resolve => {
    chrome.storage.sync.get("xTwitterContentFlag", resolve);
  });

  if (url.includes("x.com") && xTwitterContentFlag) {
    const { runXTwitter } = await import(chrome.runtime.getURL('/contents/xTwitterContent.js'));
    await runXTwitter();
  } else {
    const { runGeneric } = await import(chrome.runtime.getURL('/contents/generalContent.js'));
    await runGeneric();
  }
})();
