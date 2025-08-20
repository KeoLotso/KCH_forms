const CLIENT_ID = "1407820802203848734"

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookie = parts.pop().split(';').shift()
    try {
      return decodeURIComponent(cookie)
    } catch (e) {
      console.error('Cookie decode error:', e)
      return null
    }
  }
  return null
}

function loadUser() {
  const userCookie = getCookie("user")
  const authDiv = document.getElementById("auth")
  const appDiv = document.getElementById("app")

  console.log("User cookie:", userCookie)

  if (!userCookie) {
    console.log("No user cookie found")
    authDiv.style.display = "block"
    appDiv.style.display = "none"
    return
  }

  try {
    const user = JSON.parse(userCookie)
    console.log("Parsed user data:", user)

    if (!user.id) {
      throw new Error("Invalid user data")
    }

    authDiv.style.display = "none"
    appDiv.style.display = "block"
    
    document.getElementById("username").innerText = user.global_name || user.username
    document.getElementById("avatar").src = user.avatar 
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
      : 'https://cdn.discordapp.com/embed/avatars/0.png'
  } catch (error) {
    console.error("Error parsing user cookie:", error)
    document.cookie = "user=; Path=/; Max-Age=0"
    authDiv.style.display = "block"
    appDiv.style.display = "none"
  }
}

const FORM_QUESTIONS = {
  ban_appeal: [
    { name: "reason", label: "Why were you banned?", type: "text" },
    { name: "duration", label: "How long have you been banned?", type: "text" },
    { name: "reflection", label: "What have you learned from this experience?", type: "textarea" },
    { name: "prevention", label: "How will you prevent this from happening again?", type: "textarea" }
  ],
  custom_channel: [
    { name: "channel_name", label: "Desired channel name", type: "text" },
    { name: "channel_topic", label: "Channel topic/purpose", type: "text" },
    { name: "channel_description", label: "Detailed description of your channel", type: "textarea" },
    { name: "activity_plans", label: "How will you keep the channel active?", type: "textarea" }
  ],
  mod_app: [
    { name: "age", label: "How old are you?", type: "text" },
    { name: "timezone", label: "What is your timezone?", type: "text" },
    { name: "experience", label: "Previous moderation experience", type: "textarea" },
    { name: "availability", label: "How many hours per week can you dedicate?", type: "text" },
    { name: "motivation", label: "Why do you want to be a moderator?", type: "textarea" }
  ]
};

function renderQuestions(type) {
  const questionsDiv = document.getElementById("questions");
  questionsDiv.innerHTML = "";
  
  FORM_QUESTIONS[type].forEach(question => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-wrapper";
    
    const label = document.createElement("label");
    label.textContent = question.label;
    
    const input = document.createElement(question.type === "textarea" ? "textarea" : "input");
    input.type = question.type === "textarea" ? undefined : question.type;
    input.name = question.name;
    input.className = "question";
    
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    questionsDiv.appendChild(wrapper);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUser()

  const loginBtn = document.getElementById("loginBtn")
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const redirectUri = `${window.location.origin}/api/oauth`
      const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`
      window.location.href = url
    })
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    document.cookie = "user=; Path=/; Max-Age=0"
    location.reload()
  })

  const typeSelect = document.getElementById("type");
  if (typeSelect) {
    renderQuestions(typeSelect.value);
    
    typeSelect.addEventListener("change", (e) => {
      renderQuestions(e.target.value);
    });
  }

  document.getElementById("submitBtn").addEventListener("click", async () => {
    const typeSelect = document.getElementById("type")
    const answers = {}
    document.querySelectorAll(".question").forEach(q => {
      answers[q.name] = q.value
    })
    const response = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeSelect.value, answers })
    })
    if (response.ok) {
      alert("Application sent")
    } else {
      alert("Failed to send application")
    }
  })
})
