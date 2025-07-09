document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("customGreetingInput");
    const saveBtn = document.getElementById("saveGreetingBtn");
    const resetBtn = document.getElementById("resetGreetingBtn");
  
    // Load saved greeting on load
    buildfire.datastore.get("GreetingSettings", (err, result) => {
      if (result && result.data && result.data.customGreeting) {
        input.value = result.data.customGreeting;
      }
    });
  
    saveBtn.addEventListener("click", () => {
      const greeting = input.value.trim();
      buildfire.datastore.save({ customGreeting: greeting }, "GreetingSettings", () => {
        alert("Greeting saved!");
      });
    });
  
    resetBtn.addEventListener("click", () => {
      buildfire.datastore.save({ customGreeting: "" }, "GreetingSettings", () => {
        input.value = "";
        alert("Greeting reset to default!");
      });
    });
  });
  