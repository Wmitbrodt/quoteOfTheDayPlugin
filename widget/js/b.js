document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const greetingText = document.getElementById("greetingText");
  const currentTime = document.getElementById("currentTime");
  const categoryLabel = document.querySelector("label[for='categorySelect']");
  const categorySelect = document.getElementById("categorySelect");
  const quoteContainer = document.getElementById("quoteContainer");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  const anotherBtn = document.getElementById("anotherBtn");

  // App state
  let settings = {};
  let quotesData = {};
  let currentCategory = "";
  let currentQuotes = [];

  // Displays either the saved custom greeting or a dynamic one based on time of day
  function updateGreeting(customGreeting = null) {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Hello";

    if (hours < 12) greeting = "Good morning";
    else if (hours < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const timeString = now.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });

    greetingText.innerHTML = customGreeting || greeting;
    currentTime.textContent = timeString;
  }

  // Apply all UI behavior based on saved plugin settings
  function applySettings() {
    const showGreetingValue = settings.showGreeting !== false;
    const showTimeValue = settings.showTime !== false;

    greetingText.style.display = showGreetingValue ? "block" : "none";
    currentTime.style.display = showTimeValue ? "block" : "none";
    anotherBtn.style.display = settings.allowQuoteReset !== false ? "inline-block" : "none";

    const showCategoryUI = !settings.chooseRandomCategories;
    categorySelect.style.display = showCategoryUI ? "block" : "none";
    if (categoryLabel) categoryLabel.style.display = showCategoryUI ? "block" : "none";

    // Fetch custom greeting (if set), otherwise fall back to dynamic
    if (showGreetingValue || showTimeValue) {
      buildfire.datastore.get("GreetingSettings", (err, result) => {
        if (err) updateGreeting();
        else updateGreeting(result?.data?.customGreeting);
      });
    }
  }

  // Populate the category dropdown
  function populateCategories(categories) {
    categorySelect.innerHTML = `<option value="">-- Choose a category --</option>`;
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // Combine all category quote arrays into one flat array
  function getAllQuotes() {
    return Object.values(quotesData).flat();
  }

  // Try to re-use the quote of the day if it’s already stored locally
  function showQuoteOfTheDay() {
    const today = new Date().toISOString().split("T")[0];
    const key = `lastQuote_${settings.chooseRandomCategories ? 'random' : currentCategory}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          quoteText.textContent = `"${parsed.text}"`;
          quoteAuthor.textContent = `— ${parsed.author}`;
          return;
        }
      } catch (e) {
        console.warn("Invalid saved quote format:", e);
      }
    }

    // If no saved quote or it's outdated, pick a new one
    showRandomQuote(true);
  }

  // Show a random quote from the selected category (or all)
  function showRandomQuote(save = false) {
    const quotes = settings.chooseRandomCategories ? getAllQuotes() : currentQuotes;
    if (!quotes.length) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;

    if (save) {
      const today = new Date().toISOString().split("T")[0];
      const key = `lastQuote_${settings.chooseRandomCategories ? 'random' : currentCategory}`;
      localStorage.setItem(key, JSON.stringify({
        text: quote.text,
        author: quote.author,
        date: today
      }));
    }
  }

  // When a new category is selected from the dropdown
  categorySelect.addEventListener("change", () => {
    currentCategory = categorySelect.value;
    if (!currentCategory) {
      quoteContainer.style.display = "none";
      return;
    }

    localStorage.setItem("lastSelectedCategory", currentCategory);
    currentQuotes = quotesData[currentCategory] || [];
    showQuoteOfTheDay();
    quoteContainer.style.display = "block";
  });

  // Show a new random quote on button click
  anotherBtn.addEventListener("click", () => {
    showRandomQuote(true);
  });

  // Load plugin settings, apply them, and render gradient
  buildfire.datastore.get("Settings", (err, result) => {
    if (err) console.error("Settings fetch error:", err);
    settings = result?.data || {
      showGreeting: true,
      showTime: true,
      allowQuoteReset: true,
      chooseRandomCategories: false
    };

    // ✅ Apply background color or gradient from settings
    if (settings.backgroundGradient) {
      document.body.style.background = settings.backgroundGradient;
    }

    applySettings();
  });

  // Load quotes from JSON file and show quote of the day
  fetch("../widget/data/quotes.json")
    .then(response => response.json())
    .then(data => {
      quotesData = data;
      const allCategories = Object.keys(quotesData);
      populateCategories(allCategories);

      // Restore last selected category or default to the first
      if (!settings.chooseRandomCategories) {
        const savedCategory = localStorage.getItem("lastSelectedCategory");
        if (savedCategory && quotesData[savedCategory]) {
          currentCategory = savedCategory;
          categorySelect.value = savedCategory;
          currentQuotes = quotesData[currentCategory];
        } else {
          currentCategory = allCategories[0];
          currentQuotes = quotesData[currentCategory];
        }
      }

      quoteContainer.style.display = "block";
      showQuoteOfTheDay();
    })
    .catch(err => {
      console.error("Failed to load quotes.json:", err);
      quoteText.textContent = "Failed to load quotes.";
    });
});
