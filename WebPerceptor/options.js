document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const customText = document.getElementById("customStyleText");
  const customTextAdvanced = document.getElementById("customStyleTextAdvanced");
  
  const excludedUrlsInput = document.getElementById("excludedUrls");
  const excludeListedURLPatternsCheckbox = document.getElementById("excludeListedURLPatterns");
  const onlyRewriteCheckbox = document.getElementById("onlyRewriteListed");
  const apiKeyInput = document.getElementById("apiKey");
  const apiModelInput = document.getElementById("apiModel");
  const localModelInput = document.getElementById("localModel");
  const showBannerCheckbox = document.getElementById("showBanner");
  const localLLMCheckbox = document.getElementById("localLLMFlag");

  const scriptSkipTagCheckbox = document.getElementById("scriptSkipTag");
  const styleSkipTagCheckbox = document.getElementById("styleSkipTag");
  const noscriptSkipTagCheckbox = document.getElementById("noscriptSkipTag");
  const navSkipTagCheckbox = document.getElementById("navSkipTag");
  const footerSkipTagCheckbox = document.getElementById("footerSkipTag");
  const headerSkipTagCheckbox = document.getElementById("headerSkipTag");
  const asideSkipTagCheckbox = document.getElementById("asideSkipTag");
  const iframeSkipTagCheckbox = document.getElementById("iframeSkipTag");
  const inputSkipTagCheckbox = document.getElementById("inputSkipTag");
  const buttonSkipTagCheckbox = document.getElementById("buttonSkipTag");

  const tableParagraphTagCheckbox = document.getElementById("tableParagraphTag");
  const theadParagraphTagCheckbox = document.getElementById("theadParagraphTag");
  const tbodyParagraphTagCheckbox = document.getElementById("tbodyParagraphTag");
  const trParagraphTagCheckbox = document.getElementById("trParagraphTag");
  const tdParagraphTagCheckbox = document.getElementById("tdParagraphTag");
  const ulParagraphTagCheckbox = document.getElementById("ulParagraphTag");
  const olParagraphTagCheckbox = document.getElementById("olParagraphTag");
  const liParagraphTagCheckbox = document.getElementById("liParagraphTag");
  const formParagraphTagCheckbox = document.getElementById("formParagraphTag");
  const asideParagraphTagCheckbox = document.getElementById("asideParagraphTag");
  const navParagraphTagCheckbox = document.getElementById("navParagraphTag");

  const xTwitterContentCheckbox = document.getElementById("xTwitterContentFlag");
  const slackContentCheckbox = document.getElementById("slackContentFlag");
  const skipSlackUsersInput = document.getElementById("slackSkipUsers");

  const modeSelect = document.getElementById("modeSelect");
  const rewriteOptions = document.getElementById("rewriteOptions");
  const rewriteAdvancedOptions = document.getElementById("rewriteAdvancedOptions");
  const appendOptions = document.getElementById("appendOptions");
  const appendMode = document.getElementById("appendMode");
  const appendCustomOptions = document.getElementById("appendCustomOptions");
  const appendLanguageOptions = document.getElementById("appendLanguageOptions");
  const appendFactCheckOptions = document.getElementById("appendFactCheckOptions");
  const appendDinoOptions = document.getElementById("appendDinoOptions");
  const appendLanguageOptionTextBox = document.getElementById("appendLanguageOptionTextBox");
  const appendCustomOptionTextBox = document.getElementById("appendCustomOptionTextBox");

  const platformSelect = document.getElementById("platformSelect");
  const twitterOptions = document.getElementById("twitterOptions");
  const slackOptions = document.getElementById("slackOptions");

  const gangsterRapBtn = document.getElementById("rewritePromptGangsterRap");
  const donaldTrumpBtn = document.getElementById("rewritePromptDonaldTrump");



  const noModificationNotice = document.getElementById("noModificationNotice");
  let noModificationNoticeChanges = false;

  function markNoModificationNotice() {
    if (!noModificationNoticeChanges) {
      noModificationNoticeChanges = true;
      noModificationNotice.style.display = "block";
    }
  }

  function clearNoModificationNotice() {
    noModificationNoticeChanges = false;
    noModificationNotice.style.display = "none";
  }


  const rewriteAndReplaceNotice = document.getElementById("rewriteAndReplaceNotice");
  let rewriteAndReplaceNoticeChanges = false;

  function markRewriteAndReplaceNotice() {
    if (!rewriteAndReplaceNoticeChanges) {
      rewriteAndReplaceNoticeChanges = true;
      rewriteAndReplaceNotice.style.display = "block";
    }
  }

  function clearRewriteAndReplaceNotice() {
    rewriteAndReplaceNoticeChanges = false;
    rewriteAndReplaceNotice.style.display = "none";
  }

  const appendNotice = document.getElementById("appendNotice");
  let appendNoticeChanges = false;

  function markAppendNotice() {
    if (!appendNoticeChanges) {
      appendNoticeChanges = true;
      appendNotice.style.display = "block";
    }
  }

  function clearAppendNotice() {
    appendNoticeChanges = false;
    appendNotice.style.display = "none";
  }


  const llmOnlineActiveModelNotice = document.getElementById("llmOnlineActiveModelNotice");
  let llmOnlineActiveModelNoticeChanges = false;

  function markllmOnlineActiveModelNotice() {
    if (!llmOnlineActiveModelNoticeChanges) {
      llmOnlineActiveModelNoticeChanges = true;
      llmOnlineActiveModelNotice.style.display = "block";
    }
  }

  function clearllmOnlineActiveModelNotice() {
    llmOnlineActiveModelNoticeChanges = false;
    llmOnlineActiveModelNotice.style.display = "none";
  }

  const llmOfflineActiveModelNotice = document.getElementById("llmOfflineActiveModelNotice");
  let llmOfflineActiveModelNoticeChanges = false;

  function markllmOfflineActiveModelNotice() {
    if (!llmOfflineActiveModelNoticeChanges) {
      llmOfflineActiveModelNoticeChanges = true;
      llmOfflineActiveModelNotice.style.display = "block";
    }
  }

  function clearllmOfflineActiveModelNotice() {
    llmOfflineActiveModelNoticeChanges = false;
    llmOfflineActiveModelNotice.style.display = "none";
  }




  // --- Utility ---
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // --- Save Function ---
  function saveSettings() {
    const mode = modeSelect.value;
    const append = appendMode.value;
    const appendLanguageOptionText = appendLanguageOptionTextBox.value;
    const appendCustomOptionText = appendCustomOptionTextBox.value;
    const key = apiKeyInput.value.trim();
    const model = apiModelInput.value.trim();
    const localLLM = localModelInput.value.trim();

    let style = null;

    let customStyleValue = "";
    if (customText.value.trim().length > 0) {
      style = "custom";
      customStyleValue = customText.value.trim();
    }

    let customStyleValueAdvanced = "";
    if (customTextAdvanced.value.trim().length > 0) {
      style = "custom";
      customStyleValueAdvanced = customTextAdvanced.value.trim();
    }

    const excludedList = excludedUrlsInput.value
      .split("\n")
      .map(u => u.trim())
      .filter(Boolean);

    const slackSkipUsersList = skipSlackUsersInput.value
      .split(",")
      .map(u => u.trim())
      .filter(Boolean);

    chrome.storage.sync.set({
      modeSelect: mode,
      appendMode: append,
      appendLanguageOptionTextBox: appendLanguageOptionText,
      appendCustomOptionTextBox: appendCustomOptionText,
      apiKey: key,
      apiModel: model,
      localModel: localLLM,
      style: style,

      customStyleText: customStyleValue,
      customStyleTextAdvanced: customStyleValueAdvanced,

      excludedUrls: excludedList,
      excludeListedURLPatterns: excludeListedURLPatternsCheckbox.checked,
      onlyRewriteListed: onlyRewriteCheckbox.checked,
      showBanner: showBannerCheckbox.checked,
      localLLMFlag: localLLMCheckbox.checked,
      xTwitterContentFlag: xTwitterContentCheckbox.checked,
      slackContentFlag: slackContentCheckbox.checked,
      scriptSkipTag: scriptSkipTagCheckbox.checked,
      styleSkipTag: styleSkipTagCheckbox.checked,
      noscriptSkipTag: noscriptSkipTagCheckbox.checked,
      navSkipTag: navSkipTagCheckbox.checked,
      footerSkipTag: footerSkipTagCheckbox.checked,
      headerSkipTag: headerSkipTagCheckbox.checked,
      asideSkipTag: asideSkipTagCheckbox.checked,
      iframeSkipTag: iframeSkipTagCheckbox.checked,
      inputSkipTag: inputSkipTagCheckbox.checked,
      buttonSkipTag: buttonSkipTagCheckbox.checked,
      tableParagraphTag: tableParagraphTagCheckbox.checked,
      theadParagraphTag: theadParagraphTagCheckbox.checked,
      tbodyParagraphTag: tbodyParagraphTagCheckbox.checked,
      trParagraphTag: trParagraphTagCheckbox.checked,
      tdParagraphTag: tdParagraphTagCheckbox.checked,
      ulParagraphTag: ulParagraphTagCheckbox.checked,
      olParagraphTag: olParagraphTagCheckbox.checked,
      liParagraphTag: liParagraphTagCheckbox.checked,
      formParagraphTag: formParagraphTagCheckbox.checked,
      asideParagraphTag: asideParagraphTagCheckbox.checked,
      navParagraphTag: navParagraphTagCheckbox.checked,
      slackSkipUsers: slackSkipUsersList
    });
  }

  const autoSave = debounce(saveSettings, 200);

  // --- Event Listeners ---
  function setupAutoSave(element, event = "input") {
    element?.addEventListener(event, autoSave);
  }

  // Text inputs
  [customText, customTextAdvanced, apiKeyInput, apiModelInput, localModelInput, excludedUrlsInput, appendCustomOptionTextBox, appendLanguageOptionTextBox, skipSlackUsersInput]
    .forEach(el => setupAutoSave(el));

  // Checkboxes
  [
    showBannerCheckbox, localLLMCheckbox,
    scriptSkipTagCheckbox, styleSkipTagCheckbox, noscriptSkipTagCheckbox, navSkipTagCheckbox,
    footerSkipTagCheckbox, headerSkipTagCheckbox, asideSkipTagCheckbox, iframeSkipTagCheckbox,
    inputSkipTagCheckbox, buttonSkipTagCheckbox, tableParagraphTagCheckbox, theadParagraphTagCheckbox,
    tbodyParagraphTagCheckbox, trParagraphTagCheckbox, tdParagraphTagCheckbox, ulParagraphTagCheckbox,
    olParagraphTagCheckbox, liParagraphTagCheckbox, formParagraphTagCheckbox, asideParagraphTagCheckbox,
    navParagraphTagCheckbox, xTwitterContentCheckbox, slackContentCheckbox
  ].forEach(el => setupAutoSave(el, "change"));

  // Dropdowns
  [modeSelect, appendMode, platformSelect].forEach(el => setupAutoSave(el, "change"));

  // --- Mode Handling ---
  modeSelect.addEventListener("change", () => {
    const value = modeSelect.value;
  
    // hide all platform options first
    rewriteOptions.style.display = "none";
    rewriteAdvancedOptions.style.display = "none";
    appendOptions.style.display = "none";
    
    markNoModificationNotice();
    clearRewriteAndReplaceNotice();
    clearAppendNotice();

    // show only the selected platform
    if (value === "rewrite") {
      rewriteOptions.style.display = "block";
      markRewriteAndReplaceNotice();                  // This could probably be a generic function actually - where you pass parameters for it?
      clearNoModificationNotice();
      clearAppendNotice();
    } else if (value === "rewriteAdvanced") { 
      rewriteAdvancedOptions.style.display = "block";
      markRewriteAndReplaceNotice();
      clearNoModificationNotice();
      clearAppendNotice();
    } else if (value === "append") {
      appendOptions.style.display = "block";
      markAppendNotice();
      clearNoModificationNotice();
      clearRewriteAndReplaceNotice();
    }
  });

  appendMode.addEventListener("change", () => {
    const value = appendMode.value;
  
    // hide all platform options first
    appendLanguageOptions.style.display = "none";
    appendFactCheckOptions.style.display = "none";
    appendDinoOptions.style.display = "none";
    appendCustomOptions.style.display = "none";
    
    // show only the selected platform
    if (value === "appendLanguage") {
      appendLanguageOptions.style.display = "block";
    } else if (value === "appendFactCheck") {
      appendFactCheckOptions.style.display = "block";
    } else if (value === "appendDino") {
      appendDinoOptions.style.display = "block";
    } else if (value === "appendCustom") {
      appendCustomOptions.style.display = "block";
    }      
  });

  let localLLMOff = true;
  localLLMCheckbox.addEventListener("change", () => {
    
    if (localLLMOff)
    {
      markllmOfflineActiveModelNotice();
      clearllmOnlineActiveModelNotice();  
      localLLMOff = false;
    } else {
      markllmOnlineActiveModelNotice();
      clearllmOfflineActiveModelNotice();
      localLLMOff = true;
    }
  });


  excludeListedURLPatternsCheckbox.addEventListener("change", () => {  
    if ( !(onlyRewriteCheckbox.checked && excludeListedURLPatternsCheckbox.checked) )
    {
      onlyRewriteCheckbox.checked = true;
      autoSave();
    } else {
      onlyRewriteCheckbox.checked = false;
      autoSave();    
    }    
  });


  onlyRewriteCheckbox.addEventListener("change", () => {
    if ( !(onlyRewriteCheckbox.checked && excludeListedURLPatternsCheckbox.checked) )
    {
      excludeListedURLPatternsCheckbox.checked = true;
      autoSave();
    } else {
      excludeListedURLPatternsCheckbox.checked = false;
      autoSave();
    }
    
  });


  platformSelect.addEventListener("change", () => {
    twitterOptions.style.display = platformSelect.value === "twitter" ? "block" : "none";
    slackOptions.style.display = platformSelect.value === "slack" ? "block" : "none";
  });

  // Preset buttons
  gangsterRapBtn.addEventListener("click", () => {
    customText.value = "gangster rap";
    autoSave();
  });

  donaldTrumpBtn.addEventListener("click", () => {
    customText.value = "angry Donald Trump";
    autoSave();
  });

  // --- Load saved settings ---
  chrome.storage.sync.get(
    [
      "apiKey", "apiModel", "localModel", "style", "customStyleText", "customStyleTextAdvanced",
      "excludedUrls", "excludeListedURLPatterns", "onlyRewriteListed",
      "showBanner", "localLLMFlag", "xTwitterContentFlag", "slackContentFlag"
    ],
    (data) => {
      if (data.apiKey) apiKeyInput.value = data.apiKey;
      if (data.apiModel) apiModelInput.value = data.apiModel;
      if (data.localModel) localModelInput.value = data.localModel;
      if (data.style === "custom" && data.customStyleText) customText.value = data.customStyleText;
      if (data.customStyleTextAdvanced) customTextAdvanced.value = data.customStyleTextAdvanced;
      excludedUrlsInput.value = Array.isArray(data.excludedUrls) ? data.excludedUrls.join("\n") : "";
      // excludeListedURLPatternsCheckbox.checked = !!data.excludeListedURLPatterns;
      // onlyRewriteCheckbox.checked = !!data.onlyRewriteListed;
      showBannerCheckbox.checked = data.showBanner !== undefined ? data.showBanner : true;
      localLLMCheckbox.checked = !!data.localLLMFlag;
      xTwitterContentCheckbox.checked = data.xTwitterContentFlag !== undefined ? data.xTwitterContentFlag : true;
      slackContentCheckbox.checked = data.slackContentFlag !== undefined ? data.slackContentFlag : true;
    }
  );
});
