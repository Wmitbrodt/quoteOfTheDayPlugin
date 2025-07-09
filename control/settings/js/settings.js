document.addEventListener("DOMContentLoaded", () => {
  const chooseRandomCategories = document.getElementById("chooseRandomCategories");
  const showGreeting = document.getElementById("showGreeting");
  const showTime = document.getElementById("showTime");
  const allowQuoteReset = document.getElementById("allowQuoteReset");
  const backgroundGradientInput = document.getElementById("backgroundGradientInput");
  const saveBtn = document.getElementById("saveBtn");

  // Load saved settings and populate form fields
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

  // Save settings when the Save button is clicked
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
});
