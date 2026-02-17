export async function runGeneric() {

  const { apiModel } = await new Promise(resolve => {
    chrome.storage.sync.get("apiModel", resolve);
  });

  const { localModel } = await new Promise(resolve => {
    chrome.storage.sync.get("localModel", resolve);
  });

  const { localLLMFlag } = await new Promise(resolve => {
    chrome.storage.sync.get("localLLMFlag", resolve);
  });

  const { modeSelect } = await new Promise(resolve => {
    chrome.storage.sync.get("modeSelect", resolve);
  });

  const { appendMode } = await new Promise(resolve => {
    chrome.storage.sync.get("appendMode", resolve);
  });

  const skipTagIds = [
    "scriptSkipTag","styleSkipTag","noscriptSkipTag","navSkipTag",
    "footerSkipTag","headerSkipTag","asideSkipTag","iframeSkipTag",
    "inputSkipTag","buttonSkipTag"
  ];

  const booleanSkipTags = await new Promise(resolve => {
    chrome.storage.sync.get(skipTagIds, data => {
      const valuesArray = skipTagIds.map(id => !!data[id]);
      resolve(valuesArray);
    });
  });

  const paragraphTagIds = [
    "tableParagraphTag","theadParagraphTag","tbodyParagraphTag","trParagraphTag",
    "tdParagraphTag","ulParagraphTag","olParagraphTag","liParagraphTag",
    "formParagraphTag","asideParagraphTag","navParagraphTag"
  ];

  const booleanParagraphTags = await new Promise(resolve => {
    chrome.storage.sync.get(paragraphTagIds, data => {
      const valuesArray = paragraphTagIds.map(id => !!data[id]);
      resolve(valuesArray);
    });
  });

  async function shouldRewritePage() {
    return new Promise(resolve => {
      chrome.storage.sync.get(["excludedUrls", "onlyRewriteListed"], data => {
        const urlPatterns = data.excludedUrls || [];
        const onlyListed = data.onlyRewriteListed || false;
        const currentUrl = window.location.href;

        // Convert wildcard pattern to regex
        const matchesPattern = urlPatterns.some(pattern => {
          const regex = new RegExp(
            "^" +
            pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*") +
            "$"
          );
          return regex.test(currentUrl);
        });

        // If "only rewrite listed" is checked, page must match a pattern
        // otherwise rewrite unless it matches a "skip" pattern
        resolve(onlyListed ? matchesPattern : !matchesPattern);
      });
    });
  }

  if (!(await shouldRewritePage())) {
    console.log("Page skipped by rewrite filter:", window.location.href);
    const banner = document.createElement("div");
    banner.id = "webperceptor-banner"; 
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 99999;
      padding: 16px 20px;
      background: #fef3c7; /* warning yellow */
      color: #92400e;      /* dark amber text */
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      border-bottom: 4px solid #f59e0b; /* warning accent */
    `;
    banner.textContent = "Page has been skipped for modification by the WebPerceptor plugin.";
    document.body.appendChild(banner);

    // push content down so nothing is covered
    const h = banner.getBoundingClientRect().height;
    document.documentElement.style.paddingTop = `${h}px`;

    // optional: keep correct on resize (responsive banner height)
    window.addEventListener("resize", () => {
      const h2 = banner.getBoundingClientRect().height;
      document.documentElement.style.paddingTop = `${h2}px`;
    });

    return; // stop script completely
  }

  // --- STATE TRACKING ---
  const rewrittenElements = new WeakSet();
  let blockCounter = 0;
  const blocks = [];
  const originalMap = new Map();
  let rewrittenCount = 0;

  // --- BENCHMARKING ---
  let benchmarkStartTime = null;   // timestamp of first rewrite
  let inFlightRewrites = 0;        // how many rewrites are currently running

  const tagNames = ["SCRIPT", "STYLE", "NOSCRIPT", "NAV", "FOOTER", "HEADER", "ASIDE", "IFRAME", "INPUT", "BUTTON"];

  const SKIP_TAGS = new Set(
    tagNames.filter((_, index) => booleanSkipTags[index])
  );

  function isCoreParagraph(el) {
    if (!el) return false;
    let parent = el.parentElement;
    while (parent) {
      const tag = parent.tagName;

      const paragraphTags = ["TABLE", "THEAD", "TBODY", "TR", "TD", "UL", "OL", "LI", "FORM", "ASIDE", "NAV"];
      const PARA_TAGS = paragraphTags.filter((_, index) => booleanParagraphTags[index]);

      if (PARA_TAGS.includes(tag)) {
        return false;
      }
      parent = parent.parentElement;
    }
    return true;
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  // --- WRAP TEXT NODES INTO BLOCKS ---
  function tagTextNodes(node) {
    if (
      node?.nodeType === Node.ELEMENT_NODE &&
      (node.id === "webperceptor-banner" || node.closest?.("#webperceptor-banner"))
    ) {
      return [];
    }

    const newBlocks = [];
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && SKIP_TAGS.has(child.tagName)) return;

      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (!text) return;

        const group = [child];
        let next = child.nextSibling;
        while (
          next &&
          (
            next.nodeType === Node.TEXT_NODE ||
            (next.nodeType === Node.ELEMENT_NODE && !SKIP_TAGS.has(next.tagName) && next.tagName !== "BR")
          )
        ) {
          group.push(next);
          next = next.nextSibling;
        }

        const combined = group
          .map(n => n.textContent.trim())
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (combined.length < 20) return;
        if (!isCoreParagraph(group[0].parentElement)) return;

        const blockId = `block-${blockCounter++}`;
        const parentEl = group[0].parentElement;

        originalMap.set(blockId, combined);
        blocks.push({ id: blockId, text: combined, el: parentEl });
        newBlocks.push({ id: blockId, text: combined, el: parentEl });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        newBlocks.push(...tagTextNodes(child));
      }
    });
    return newBlocks;
  }

  function applyRewritten(el, text) {

    if (modeSelect === "append") {

      if (appendMode === "appendCustom") {
        if (text.slice(0, 10) === `12345abcde`) {
          return;
        } else {
          el.innerText = el.innerText + " " + text;
        }
      }

      // TODO: appendLanguage is buggy when using the HTML view and the other one rewrites the whole thing in colour
      if (appendMode === "appendLanguage") {
        el.innerText = el.innerText + "\n\n" + text;
        el.style.color = "red";
      }

      if (appendMode === "appendDino") {
        if (text.slice(0, 2) === `No`) {
          return;
        } else {
          el.innerText = el.innerText + " " + text;
          el.style.color = "red";
        }
      }

      if (appendMode === "appendFactCheck") {
        if (text.slice(0, 5) === "false") {
          el.innerText = el.innerText + " FALSE:" + text.slice(7);
          el.style.color = "red";
        } else {
          return;
        }
      }

    } else if (modeSelect === "rewrite" || modeSelect === "rewriteAdvanced") {
      el.innerText = text;
    }
  }

  // --- BACKGROUND REWRITE ---
  async function rewriteBlock(b) {
    if (!b.el || rewrittenElements.has(b.el) || b._rewriting) return;

    // Mark element as rewriting to avoid double rewrites
    b._rewriting = true;
    rewrittenElements.add(b.el);

    // --- BENCHMARK START ---
    if (benchmarkStartTime === null) {
      benchmarkStartTime = performance.now();
      console.log("[rewriter] Benchmark started");
    }
    inFlightRewrites++;
    // --- END BENCHMARK START ---

    // Set opacity to indicate processing
    b.el.style.opacity = "0.1";

    // --- Force browser to render the opacity change before async rewrite ---
    await new Promise(resolve => requestAnimationFrame(resolve));

    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: "rewriteText", text: b.text }, response => {
        // Apply rewritten text or fallback
        applyRewritten(b.el, response?.rewritten || b.text);

        // Reset opacity
        b.el.style.opacity = "1";

        // Update progress banner
        rewrittenCount++;

        if (localLLMFlag) 
        {
          banner.textContent = `The content of this page is being modified by the WebPerceptor plugin (model: ${localModel}). Currently modified: ${rewrittenCount} text elements.`;
        } else {
          banner.textContent = `The content of this page is being modified by the WebPerceptor plugin (model: ${apiModel}). Currently modified: ${rewrittenCount} text elements.`;
        }

        // Clean up rewriting flag
        b._rewriting = false;

        // --- BENCHMARK END CHECK ---
        inFlightRewrites--;
        if (inFlightRewrites === 0 && benchmarkStartTime !== null) {
          const durationMs = performance.now() - benchmarkStartTime;
          const durationSec = (durationMs / 1000).toFixed(3);

          console.log(
            `[rewriter] Finished processing ${rewrittenCount} elements ` +
            `(out of ${blocks.length} detected) in ${durationSec}s`
          );

          // Show completion in banner
          if (localLLMFlag) 
        {
          banner.textContent = `The content of this page has been modified by the WebPerceptor plugin (model: ${localModel}). ${rewrittenCount} text elements were modified in ${durationSec}s.`;
        } else {
          banner.textContent = `The content of this page has been modified by the WebPerceptor plugin (model: ${apiModel}). ${rewrittenCount} text elements were modified in ${durationSec}s.`;
        }

          // Reset so a later burst of dynamic content can be benchmarked separately.
          benchmarkStartTime = null;
        }
        // --- END BENCHMARK END CHECK ---

        resolve();
      });
    });
  }

  // --- BANNER ---
  const banner = document.createElement("div");
  banner.id = "webperceptor-banner"; 
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 99999;
    padding: 16px 20px;
    background: #fef3c7; /* warning yellow */
    color: #92400e;      /* dark amber text */
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    border-bottom: 4px solid #f59e0b; /* warning accent */
  `;

  // Wait for document.body if it doesn't exist yet
  if (!document.body) {
    await new Promise(resolve => {
      window.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  // Start hidden if showBanner is false
  chrome.storage.sync.get(["showBanner"], ({ showBanner }) => {
    banner.style.display = showBanner ? "block" : "none";
  });


  banner.textContent = `The content of this page is being modified by the WebPerceptor plugin.`;
  document.body.appendChild(banner);

  // push content down so nothing is covered
  const h = banner.getBoundingClientRect().height;
  document.documentElement.style.paddingTop = `${h}px`;

  // optional: keep correct on resize (responsive banner height)
  window.addEventListener("resize", () => {
    const h2 = banner.getBoundingClientRect().height;
    document.documentElement.style.paddingTop = `${h2}px`;
  });

  // --- PROCESS ELEMENTS ---
  async function processElements(visibleOnly = false) {
    const newBlocks = tagTextNodes(document.body)
      .filter(b => b.el && !rewrittenElements.has(b.el))
      .filter(b => !visibleOnly || isVisible(b.el)); // if visibleOnly, skip offscreen elements

    if (!newBlocks.length) return;
    await Promise.all(newBlocks.map(rewriteBlock));
  }

  // --- INITIAL STATIC REWRITE ---
  await processElements(false); // rewrite ALL static blocks immediately

  // --- DEBOUNCE FOR DYNAMIC CONTENT ---
  let debounceTimer = null;
  function scheduleProcess() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => processElements(true), 200); // only visible blocks for dynamic
  }

  // --- OBSERVE DYNAMIC CONTENT ---
  const observer = new MutationObserver(scheduleProcess);
  observer.observe(document.body, { childList: true, subtree: true });
}
