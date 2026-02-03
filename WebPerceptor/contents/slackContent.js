export async function runSlack() {

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






  let banner;
  let rewrittenMessages = 0;
  let skipUsers = [];
  const inProgress = new Map(); // message blockId -> Promise

  // 🆕 NEW: persistent cache map
  const rewriteCache = new Map(); // hash -> { originalTexts, rewrittenTexts }

  // 🆕 NEW: helper for stable hashing
  function hashText(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h) + text.charCodeAt(i);
    }
    return (h >>> 0).toString(36);
  }

  // --- Load skipUsers from storage ---
  chrome.storage.sync.get("slackSkipUsers", (data) => {
    if (Array.isArray(data.slackSkipUsers)) {
      skipUsers = data.slackSkipUsers;
      console.log("Loaded skip users:", skipUsers);
    }
    processSlackMessages(); // initial pass
  });

  // --- Banner + toggle ---
  function createBanner(totalMessages) {
    if (banner) return;
    banner = document.createElement("div");
    banner.style.cssText = `
      position:fixed;
      top:8px;
      right:8px;
      z-index:99999;
      padding:8px 12px;
      border-radius:8px;
      background:#fff;
      border:1px solid #ccc;
      font-size:12px;
    `;
    banner.innerText = `Rewriting Slack messages... (0/${totalMessages})`;
    document.body.appendChild(banner);
  }

  // --- Helpers ---
  function getMessageBodyElement(el) {
    return (
      el.querySelector('[data-qa="message-text"]') ||
      el.querySelector(".p-rich_text_section") ||
      el.querySelector(".c-message__body") ||
      el
    );
  }

  function getMessageTextNodes(el) {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".p-member_profile_hover_card"))
          return NodeFilter.FILTER_REJECT;
        if (parent.closest(".c-link.c-timestamp"))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function rewriteTextNode(node) {
    return new Promise((resolve) => {
      const original = node.textContent;
      if (!original?.trim()) return resolve(original);

      const leading = original.match(/^\s*/)?.[0] || "";
      const trailing = original.match(/\s*$/)?.[0] || "";
      const core = original.trim();

      chrome.runtime.sendMessage(
        { type: "rewriteText", text: core },
        (response) => {
          try {
            const rewrittenCore = response?.rewritten?.trim();
            if (rewrittenCore != null) {
              node.textContent = leading + rewrittenCore + trailing;
              resolve(node.textContent);
            } else {
              node.textContent = original;
              resolve(original);
            }
          } catch (err) {
            console.error("RewriteTextNode error:", err);
            node.textContent = original;
            resolve(original);
          }
        }
      );
    });
  }

  // --- Rewrite a single message block ---
  async function rewriteMessage(el) {
    if (!el || el.dataset.skip === "true" || el.dataset.processed === "true")
      return;

    const blockId = el.dataset.blockId;
    if (!blockId) return;

    // 🆕 Generate stable hash based on message content
    const messageBody = getMessageBodyElement(el);
    const textContent = messageBody?.innerText?.trim() ?? "";
    const messageHash = hashText(textContent);
    el.dataset.messageHash = messageHash;

    // 🆕 If cached, restore immediately
    if (rewriteCache.has(messageHash)) {
      const cached = rewriteCache.get(messageHash);
      const nodes = getMessageTextNodes(messageBody);
      nodes.forEach((n, i) => {
        if (cached.rewrittenTexts[i]) n.textContent = cached.rewrittenTexts[i];
      });
      el._originalTexts = cached.originalTexts;
      el._rewrittenTexts = cached.rewrittenTexts;
      el.dataset.processed = "true";
      messageBody.style.opacity = "1";
      return;
    }

    if (inProgress.has(blockId)) return inProgress.get(blockId);

    const body = getMessageBodyElement(el);
    if (!body) return;

    const nodes = getMessageTextNodes(body);
    if (!nodes.length) return;

    el._originalTexts = nodes.map((n) => n.textContent);
    el._rewrittenTexts = new Array(nodes.length);

    // Hide message body immediately (no fade-out)
    const previousOpacity = body.style.opacity;
    body.style.opacity = "0";

    const promise = (async () => {
      try {
        for (let i = 0; i < nodes.length; i++) {
          el._rewrittenTexts[i] = await rewriteTextNode(nodes[i]);
        }

        // 🆕 Cache the rewrite result persistently in memory
        rewriteCache.set(messageHash, {
          originalTexts: el._originalTexts,
          rewrittenTexts: el._rewrittenTexts,
        });

      } catch (err) {
        console.error("Rewrite message error:", err);
      } finally {
        // Always restore opacity even if rewrite fails
        body.style.opacity = "1";
        if (previousOpacity) body.style.opacity = previousOpacity;
        el.dataset.processed = "true";

        rewrittenMessages++;
        if (banner) {
          const total = banner.dataset.totalMessages ?? "?";
          banner.textContent = `Rewriting Slack messages... (${rewrittenMessages}/${total})`;
        }
      }
    })();

    inProgress.set(blockId, promise);
    try {
      await promise;
    } finally {
      inProgress.delete(blockId);
    }
  }

  // --- Process all messages ---
  async function processSlackMessages() {
    const messages = document.querySelectorAll('[data-qa="message_content"]');
    if (!messages.length) return;

    const blocks = [];
    let currentSender = null;

    messages.forEach((el, idx) => {
      if (
        el.dataset.blockId ||
        el.dataset.skip === "true" ||
        el.dataset.processed === "true"
      )
        return;

      const senderEl = el.querySelector('[data-qa="message_sender_name"]');
      if (senderEl) currentSender = senderEl.innerText.trim();

      if (currentSender && skipUsers.includes(currentSender)) {
        el.dataset.skip = "true";
        return;
      }

      const body = getMessageBodyElement(el);
      if (!body || !getMessageTextNodes(body).length) return;

      const blockId = `slack-block-${Date.now()}-${idx}`;
      el.dataset.blockId = blockId;
      el.dataset.original = getMessageTextNodes(body)
        .map((n) => n.textContent)
        .join("\u0001");
      blocks.push(el);
    });

    if (!blocks.length) return;

    if (!banner) {
      createBanner(blocks.length);
      banner.dataset.totalMessages = String(blocks.length);
    } else {
      banner.dataset.totalMessages = String(
        Number(banner.dataset.totalMessages || 0) + blocks.length
      );
    }

    await Promise.all(blocks.map((el) => rewriteMessage(el)));
  }

  // --- Observe Slack dynamically ---
  const observer = new MutationObserver(() => processSlackMessages());
  observer.observe(document.body, { childList: true, subtree: true });
}
