const botToken = "telegram bot token";

document.getElementById("saveChatId").addEventListener("click", () => {
    const chatId = document.getElementById("chatIdInput").value.trim();
    if (chatId) {
        chrome.storage.local.set({ chatId }, () => {
            alert("Chat ID saved!");
        });
    }
});

document.getElementById("sendMsg").addEventListener("click", () => {
    const message = document.getElementById("msgInput").value.trim();
    if (!message) return alert("Enter a message.");
    
    chrome.storage.local.get("chatId", ({ chatId }) => {
        if (!chatId) return alert("Chat ID not set.");
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message })
        }).then(res => {
            if (res.ok) ("Message sent!");
            else ("Failed to send message.");
        });
    });
});

document.getElementById("sendScreenshot").addEventListener("click", async () => {
    chrome.storage.local.get("chatId", async ({ chatId }) => {
        if (!chatId) return alert("Chat ID not set.");

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const screenshotUrl = await chrome.tabs.captureVisibleTab(undefined, { format: "png" });
        const blob = await (await fetch(screenshotUrl)).blob();
        
        const formData = new FormData();
        formData.append("chat_id", chatId);
        formData.append("photo", blob, "screenshot.png");

        fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: "POST",
            body: formData
        }).then(res => {
            if (res.ok) ("Screenshot sent!");
            else ("Failed to send screenshot.");
        });
    });
});

window.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("chatId", (data) => {
        if (data.chatId) {
            document.getElementById("chatIdInput").value = data.chatId;
        }
    });
});
