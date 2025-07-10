document.addEventListener("DOMContentLoaded", () => {
  const chooseRandomCategories = document.getElementById("chooseRandomCategories");
  const showGreeting = document.getElementById("showGreeting");
  const showTime = document.getElementById("showTime");
  const allowQuoteReset = document.getElementById("allowQuoteReset");
  const backgroundGradientInput = document.getElementById("backgroundGradientInput");
  const saveBtn = document.getElementById("saveBtn");

  const quoteJsonInput = document.getElementById("quoteJsonInput");
  const saveQuotesBtn = document.getElementById("saveQuotesBtn");

  // Add flash message element
  const quoteFlashMsg = document.createElement("div");
  quoteFlashMsg.style.marginTop = "8px";
  quoteFlashMsg.style.fontWeight = "bold";
  quoteJsonInput.parentNode.insertBefore(quoteFlashMsg, saveQuotesBtn.nextSibling);

  function showQuoteFlash(message, color) {
    quoteFlashMsg.textContent = message;
    quoteFlashMsg.style.color = color;
    setTimeout(() => {
      quoteFlashMsg.textContent = "";
    }, 4000);
  }

  // Load settings
  buildfire.datastore.get("Settings", (err, result) => {
    if (err) {
      console.error("Error loading settings:", err);
      return;
    }

    const data = result?.data || {};

    chooseRandomCategories.checked = !!data.chooseRandomCategories;
    showGreeting.checked = data.showGreeting !== false;
    showTime.checked = data.showTime !== false;
    allowQuoteReset.checked = data.allowQuoteReset !== false;
    backgroundGradientInput.value = data.backgroundGradient || "";
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    const newSettings = {
      chooseRandomCategories: chooseRandomCategories.checked,
      showGreeting: showGreeting.checked,
      showTime: showTime.checked,
      allowQuoteReset: allowQuoteReset.checked,
      backgroundGradient: backgroundGradientInput.value.trim()
    };

    buildfire.datastore.save(newSettings, "Settings", err => {
      if (err) {
        console.error("Error saving settings:", err);
        alert("Error saving settings.");
      } else {
        alert("Settings saved successfully!");
      }
    });
  });

  // Load quotes to prefill textarea
  buildfire.datastore.get("Quotes", (err, result) => {
    if (err) {
      console.error("Error loading Quotes data:", err);
      return;
    }

    const data = result?.data;
    if (data && typeof data === "object") {
      try {
        quoteJsonInput.value = JSON.stringify(data, null, 2);
      } catch (e) {
        console.warn("Error stringifying quotes:", e);
      }
    }
  });

  // Save new quotes with validation
  saveQuotesBtn.addEventListener("click", () => {
    let parsed;
    try {
      parsed = JSON.parse(quoteJsonInput.value);
    } catch (e) {
      showQuoteFlash("❌ Invalid JSON. Please check your formatting.", "red");
      return;
    }

    buildfire.datastore.save(parsed, "Quotes", err => {
      if (err) {
        console.error("Error saving quotes:", err);
        showQuoteFlash("❌ Error saving quotes.", "red");
      } else {
        showQuoteFlash("✅ Quotes saved successfully!", "green");
      }
    });
  });
});
