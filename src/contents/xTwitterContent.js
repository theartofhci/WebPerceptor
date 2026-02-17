export async function runXTwitter() {

  const { modeSelect } = await new Promise(resolve => {
    chrome.storage.sync.get("modeSelect", resolve);
  });


  // --- PAGE FILTER ---
  async function shouldRewritePage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["excludedUrls", "onlyRewriteListed"], (data) => {
        const urlPatterns = data.excludedUrls || [];
        const onlyListed = data.onlyRewriteListed || false;
        const currentUrl = window.location.href;

        const matchesPattern = urlPatterns.some((pattern) => {
          const regex = new RegExp(
            "^" +
              pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*") +
              "$"
          );
          return regex.test(currentUrl);
        });

        resolve(onlyListed ? matchesPattern : !matchesPattern);
      });
    });
  }

  if (!(await shouldRewritePage())) {
    console.log("Page skipped by rewrite filter:", window.location.href);
    const banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:8px;right:8px;z-index:99999;padding:8px 12px;border-radius:8px;background:#fff;border:1px solid #ccc;font-size:12px;color:#000";
    banner.textContent = "Page skipped by rewrite filter";
    document.body.appendChild(banner);
    return;
  }

  // --- STATE ---
  const rewrittenCache = new Map(); // stable tweetId → rewritten text
  const inProgress = new Map();     // stable tweetId → Promise

  // --- HELPERS ---
  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function getTweetId(tweetEl) {
    if (!tweetEl) return null;

    // Use statusId if available
    const link = tweetEl.querySelector('a[href*="/status/"]');
    if (link) {
      const m = link.href.match(/status\/(\d+)/);
      if (m) return m[1];
    }

    // Fallback: hash text content of this specific tweet block (handles quotes independently)
    const s = (tweetEl.innerText || "").slice(0, 200);
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
    return "hash_" + (h >>> 0).toString(36);
  }

  function applyRewritten(el, text) {


    // NOTE: Need to really look into how to engineer a good prompt for this 
    if (modeSelect === "append")
    {

      if (appendMode === "appendCustom" )
      {
        if (text.slice(0, 10) === `12345abcde`) {
          return;
        } else {
          el.innerText = el.innerText + " " + text;
        }
      }      

      // TODO: appendLanguage is buggy when using the HTML view and the other one rewrites the whole thing in colour
      if (appendMode === "appendLanguage" )
      {
        el.innerText = el.innerText + "\n\n" + text;
        el.style.color = "red";

      }      

      if (appendMode === "appendDino")
      {
        if (text.slice(0, 2) === `No`) {
          return;
        } else {
          el.innerText = el.innerText + " " + text;
          el.style.color  = "red";
        }
      }

      if (appendMode === "appendFactCheck")
      {
        if (text.slice(0, 5) === "false") {
          el.innerText = el.innerText + " FALSE:" + text.slice(7);
          el.style.color  = "red";
        } else {
          return;
        }
      }

    } else if (modeSelect === "rewrite" || modeSelect === "rewriteAdvanced") {
      el.innerText = text;
    }

    el.style.opacity = "1";
    el.dataset.rewritten = "true";
  }

  // --- CSS ---
  const style = document.createElement("style");
  style.innerHTML = `
    article div[data-testid="tweetText"],
    article div[lang][dir],
    article div[lang][dir][role="none"] {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  // --- BACKGROUND REWRITE CALL ---
  function rewriteText(text) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "rewriteText", text }, (response) => {
        resolve(response?.rewritten || text);
      });
    });
  }

  // --- HANDLE SINGLE ELEMENT ---
  async function handleElement(el) {
    if (!el || el.dataset.rewritten === "true" || el.dataset.rewriting === "true") return;

    const tweetId = getTweetId(el); // <-- hash per element, not per article

    if (tweetId && rewrittenCache.has(tweetId)) {
      applyRewritten(el, rewrittenCache.get(tweetId));
      return;
    }

    const text = el.innerText.trim();
    if (!text) {
      el.style.opacity = "1";
      return;
    }

    el.dataset.rewriting = "true";
    el.style.opacity = "0"; // white-out initial load
    
    await new Promise(resolve => requestAnimationFrame(resolve));

    let promise = tweetId ? inProgress.get(tweetId) : null;
    
    if (!promise) {
      promise = rewriteText(text);
      if (tweetId) inProgress.set(tweetId, promise);

      // After the rewrite finishes, update caches
      promise = promise.then((rewritten) => {
        if (tweetId) rewrittenCache.set(tweetId, rewritten);
        if (tweetId) inProgress.delete(tweetId);
        return rewritten;
        });
    }    
    
    try {
      const rewritten = await promise;
      applyRewritten(el, rewritten);
    } catch (err) {
      console.error("Rewrite failed:", err);
      el.style.opacity = "1";
    } finally {
      delete el.dataset.rewriting;
    }
  }

  // --- PROCESS ALL ELEMENTS ---
  async function processElements() {
    const els = document.querySelectorAll(
      'article div[data-testid="tweetText"], article div[lang][dir], article div[lang][dir][role="none"]'
    );
    const tasks = Array.from(els).map(handleElement);
    await Promise.all(tasks);
  }

  // --- OBSERVER + DEBOUNCE ---
  let debounceTimer = null;
  function scheduleProcess() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => processElements().catch(console.error), 150);
  }

  const observer = new MutationObserver(scheduleProcess);
  observer.observe(document.body, { childList: true, subtree: true });

  // --- INITIAL RUN ---
  scheduleProcess();
}