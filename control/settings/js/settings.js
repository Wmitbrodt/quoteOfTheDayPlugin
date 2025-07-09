document.addEventListener("DOMContentLoaded", () => {
  const chooseRandomCategories = document.getElementById("chooseRandomCategories");
  const showGreeting = document.getElementById("showGreeting");
  const showTime = document.getElementById("showTime");
  const allowQuoteReset = document.getElementById("allowQuoteReset");
  const saveBtn = document.getElementById("saveBtn");

  // Load saved settings
  buildfire.datastore.get("Settings", (err, result) => {
    if (err) {
      console.error("Error loading settings:", err);
      return;
    }

    const data = result?.data || {};

    // Default fallback values
    chooseRandomCategories.checked = !!data.chooseRandomCategories;
    showGreeting.checked = data.showGreeting !== false; // defaults to true
    showTime.checked = data.showTime !== false;         // defaults to true
    allowQuoteReset.checked = data.allowQuoteReset !== false; // defaults to true
  });

  // Save logic on button click
  saveBtn.addEventListener("click", () => {
    const newSettings = {
      chooseRandomCategories: chooseRandomCategories.checked,
      showGreeting: showGreeting.checked,
      showTime: showTime.checked,
      allowQuoteReset: allowQuoteReset.checked
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
