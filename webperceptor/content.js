(async function () {
  if (window.top !== window) return; // skip iframes

  const url = window.top.location.href.toLowerCase();
  
  const { xTwitterContentFlag } = await new Promise(resolve => {
    chrome.storage.sync.get("xTwitterContentFlag", resolve);
  });

  const { slackContentFlag } = await new Promise(resolve => {
    chrome.storage.sync.get("slackContentFlag", resolve);
  });

  if (url.includes("x.com") && xTwitterContentFlag) {
    const { runXTwitter } = await import(chrome.runtime.getURL('/contents/xTwitterContent.js'));
    await runXTwitter();
  } else if (url.includes("app.slack") && slackContentFlag) {
    const { runSlack } = await import(chrome.runtime.getURL('/contents/slackContent.js'));
    await runSlack();
  } else {
    const { runGeneric } = await import(chrome.runtime.getURL('/contents/generalContent.js'));
    await runGeneric();
  }
})();
