const CLIENT_ID = "1407820802203848734"

document.getElementById("loginBtn").addEventListener("click", () => {
  const redirectUri = `${window.location.origin}/api/oauth`
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`
  window.location.href = url
})

document.getElementById("logoutBtn").addEventListener("click", () => {
  document.cookie = "user=; Path=/; Max-Age=0"
  location.reload()
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift())
}

function loadUser() {
  const userCookie = getCookie("user")
  if (!userCookie) {
    document.getElementById("auth").style.display = "block"
    document.getElementById("app").style.display = "none"
    return
  }
  const user = JSON.parse(userCookie)
  document.getElementById("auth").style.display = "none"
  document.getElementById("app").style.display = "block"
  document.getElementById("username").innerText = user.username + "#" + user.discriminator
  document.getElementById("avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
}

document.addEventListener("DOMContentLoaded", loadUser)

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
