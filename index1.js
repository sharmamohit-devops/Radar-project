 document.addEventListener("copy", function (event) {
      // Change clipboard content
      event.preventDefault();
      const customMsg = "🚨 Bhai Code Copy Karne se Ghar Nhi Chalta hai....";
      if (event.clipboardData) {
        event.clipboardData.setData("text/plain", customMsg);
      } else if (window.clipboardData) {
        // For IE (old)
        window.clipboardData.setData("Text", customMsg);
      }
      alert("⚠️ Hey! Copying this code is not allowed.");
    });