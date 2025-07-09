document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveGreetingBtn");
  const resetBtn = document.getElementById("resetGreetingBtn");

  // Fetch saved greeting content from datastore and initialize the TinyMCE editor
  buildfire.datastore.get("GreetingSettings", (err, result) => {
    const savedGreeting = result?.data?.customGreeting || "";

    tinymce.init({
      selector: '#customGreetingEditor',
      menubar: false,
      plugins: 'link lists',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | link',
      setup: (editor) => {
        // Populate the editor with saved content on load
        editor.on('init', () => {
          editor.setContent(savedGreeting);
        });
      }
    });
  });

  // Save button: store current editor content to the datastore
  saveBtn.addEventListener("click", () => {
    const editor = tinymce.get('customGreetingEditor');
    const greeting = editor ? editor.getContent() : "";
    buildfire.datastore.save({ customGreeting: greeting }, "GreetingSettings", () => {
      alert("Greeting saved!");
    });
  });

  // Reset button: clears editor content and removes saved greeting from datastore
  // Widget will fall back to using the dynamic greeting (based on time of day)
  resetBtn.addEventListener("click", () => {
    const editor = tinymce.get('customGreetingEditor');
    if (editor) editor.setContent(""); // Clear UI content
    buildfire.datastore.save({ customGreeting: "" }, "GreetingSettings", () => {
      alert("Greeting reset to default!");
    });
  });
});
