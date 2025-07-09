document.addEventListener("DOMContentLoaded", () => {
  const greetingText = document.getElementById("greetingText");
  const currentTime = document.getElementById("currentTime");

  function updateGreeting(customGreeting = null) {
    const now = new Date();
    const hours = now.getHours();
    let greeting = "Hello";

    if (hours < 12) {
      greeting = "Good morning";
    } else if (hours < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }

    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    };
    const timeString = now.toLocaleTimeString(undefined, options);

    greetingText.textContent = customGreeting && customGreeting.length > 0 ? customGreeting : greeting;
    currentTime.textContent = customGreeting ? "" : timeString;
  }

  // ✅ Load greeting override from BuildFire
  buildfire.datastore.get("GreetingSettings", (err, result) => {
    if (err) {
      console.error("Greeting fetch error:", err);
      updateGreeting(); // fallback
    } else {
      const greeting = result?.data?.customGreeting;
      updateGreeting(greeting);
    }
  });

  // === YOUR ORIGINAL CODE ===

  let quotesData = {};
  let currentCategory = "";
  let currentQuotes = [];

  const categorySelect = document.getElementById("categorySelect");
  const quoteContainer = document.getElementById("quoteContainer");
  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  const anotherBtn = document.getElementById("anotherBtn");

  // ✅ Load the quotes.json file
  fetch("../widget/data/quotes.json")
    .then(response => response.json())
    .then(data => {
      quotesData = data;
      populateCategories(Object.keys(quotesData));
      restoreLastCategory(); // Restore saved category (after data loads)
    })
    .catch(err => {
      console.error("Failed to load quotes.json:", err);
      quoteText.textContent = "Failed to load quotes.";
    });

  // ✅ Populate the dropdown
  function populateCategories(categories) {
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  // ✅ Handle category selection
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

  // ✅ Restore last selected category on load
  function restoreLastCategory() {
    const savedCategory = localStorage.getItem("lastSelectedCategory");
    if (savedCategory && quotesData[savedCategory]) {
      categorySelect.value = savedCategory;
      currentCategory = savedCategory;
      currentQuotes = quotesData[currentCategory];
      showQuoteOfTheDay();
      quoteContainer.style.display = "block";
    }
  }

  // ✅ Show a quote (saved or new) for the day
  function showQuoteOfTheDay() {
    const today = new Date().toISOString().split("T")[0];
    const key = `lastQuote_${currentCategory}`;
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

    showRandomQuote(true);
  }

  // ✅ Show a random quote from currentQuotes
  function showRandomQuote(save = false) {
    if (!currentQuotes.length) return;

    const randomIndex = Math.floor(Math.random() * currentQuotes.length);
    const quote = currentQuotes[randomIndex];

    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;

    if (save) {
      const today = new Date().toISOString().split("T")[0];
      const key = `lastQuote_${currentCategory}`;
      localStorage.setItem(key, JSON.stringify({
        text: quote.text,
        author: quote.author,
        date: today
      }));
    }
  }

  // ✅ Show another quote and replace stored one
  anotherBtn.addEventListener("click", () => {
    showRandomQuote(true);
  });
});
