const form=document.getElementById("form")
const typeSelect=document.getElementById("typeSelect")
const statusBox=document.getElementById("status")
const submitBtn=document.getElementById("submitBtn")
const userBox=document.getElementById("userBox")
const mainContent=document.getElementById("mainContent")

const types={
  ban_appeal:[["Discord Tag (at time of ban)","text"],["Your current Discord Tag","text"],["Reason for ban","textarea"],["Why should we unban you?","textarea"]],
  custom_channel:[["Requested channel name","text"],["Short description","textarea"],["Category","select",["Text","Voice","Thread"]],["Who has access?","textarea"]],
  mod_app:[["Age","number"],["Timezone","text"],["Experience","textarea"],["Why mod?","textarea"]]
}

function render(type){
  form.innerHTML=""
  types[type].forEach(([label,kind,extra])=>{
    const w=document.createElement("div");w.className="field"
    const l=document.createElement("label");l.textContent=label
    let input
    if(kind==="textarea") input=document.createElement("textarea")
    else if(kind==="select"){input=document.createElement("select");extra.forEach(v=>{let o=document.createElement("option");o.value=v;o.textContent=v;input.appendChild(o)})}
    else{input=document.createElement("input");input.type=kind}
    input.name=label
    w.appendChild(l);w.appendChild(input);form.appendChild(w)
  })
}

function getUser(){
  const token=new URLSearchParams(location.search).get("token")
  if(!token) return null
  try{return JSON.parse(atob(token))}catch{return null}
}

const user=getUser()
if(user){
  const img=user.avatar?`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`:"https://cdn.discordapp.com/embed/avatars/0.png"
  userBox.innerHTML=`<img class="avatar" src="${img}"><span>${user.global_name||user.username}</span><a href="/api/oauth" class="btn">Logout</a>`
  mainContent.style.display="block"
}else{
  userBox.innerHTML=`<a href="/api/oauth" class="btn">Login with Discord</a>`
}

submitBtn.addEventListener("click",async e=>{
  e.preventDefault()
  statusBox.textContent="Sending..."
  const answers={}
  form.querySelectorAll("[name]").forEach(el=>answers[el.name]=el.value)
  try{
    const r=await fetch("/api/webhook",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:typeSelect.value,answers,user})})
    if(!r.ok) throw new Error("Failed")
    statusBox.textContent="✅ Sent"
    form.reset()
  }catch{statusBox.textContent="❌ Failed"}
})

typeSelect.addEventListener("change",()=>render(typeSelect.value))
render(typeSelect.value)
