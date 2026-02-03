  const presets = {
    basic: {
      scriptSkipTag: true,
      styleSkipTag: true,
      noscriptSkipTag: true,
      navSkipTag: true,
      footerSkipTag: true,
      headerSkipTag: true,
      asideSkipTag: true,
      iframeSkipTag: true,
      inputSkipTag: true,
      buttonSkipTag: true,

      tableParagraphTag: true,
      theadParagraphTag: true,
      tbodyParagraphTag: true,
      trParagraphTag: true,
      tdParagraphTag: true,
      ulParagraphTag: true,
      olParagraphTag: true,
      liParagraphTag: true,
      formParagraphTag: true,
      asideParagraphTag: true,
      navParagraphTag: true
    },
    advanced: {
      scriptSkipTag: true,
      styleSkipTag: true,
      noscriptSkipTag: true,
      navSkipTag: false,
      footerSkipTag: false,
      headerSkipTag: false,
      asideSkipTag: false,
      iframeSkipTag: false,
      inputSkipTag: false,
      buttonSkipTag: false,

      tableParagraphTag: false,
      theadParagraphTag: false,
      tbodyParagraphTag: false,
      trParagraphTag: false,
      tdParagraphTag: false,
      ulParagraphTag: false,
      olParagraphTag: false,
      liParagraphTag: false,
      formParagraphTag: false,
      asideParagraphTag: false,
      navParagraphTag: false
    }
  };

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  // Create a synthetic change event
  const event = new Event("change", { bubbles: true });

  // Loop through preset settings and set checkboxes
  for (const [id, value] of Object.entries(preset)) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = value;
      checkbox.dispatchEvent(event); // <-- trigger the change event
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("basicPresetBtn").addEventListener("click", () => {
    applyPreset('basic');
  });
  document.getElementById("advancedPresetBtn").addEventListener("click", () => {
    applyPreset('advanced');
  });
});