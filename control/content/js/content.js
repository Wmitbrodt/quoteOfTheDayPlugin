document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveGreetingBtn");
  const resetBtn = document.getElementById("resetGreetingBtn");

  // Load saved greeting and initialize TinyMCE
  buildfire.datastore.get("GreetingSettings", (err, result) => {
    const savedGreeting = result?.data?.customGreeting || "";
    
    tinymce.init({
      selector: '#customGreetingEditor',
      menubar: false,
      plugins: 'link lists',
      toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | link',
      setup: (editor) => {
        editor.on('init', () => {
          editor.setContent(savedGreeting);
        });
      }
    });
  });

  // Save greeting to datastore
  saveBtn.addEventListener("click", () => {
    const editor = tinymce.get('customGreetingEditor');
    const greeting = editor ? editor.getContent() : "";
    buildfire.datastore.save({ customGreeting: greeting }, "GreetingSettings", () => {
      alert("Greeting saved!");
    });
  });

  // Reset to default greeting
  resetBtn.addEventListener("click", () => {
    const editor = tinymce.get('customGreetingEditor');
    if (editor) editor.setContent(""); // Clear the editor UI
  
    // Save as null (or simply omit it) so widget falls back to dynamic
    buildfire.datastore.save({ customGreeting: "" }, "GreetingSettings", () => {
      alert("Greeting reset to default!");
    });
  });  
});
