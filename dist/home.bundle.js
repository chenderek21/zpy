(()=>{"use strict";var o,e;function n(o){const e=document.getElementById("errorMessage");e&&(e.textContent=o,e.style.display="block")}null===(o=document.getElementById("createRoomBtn"))||void 0===o||o.addEventListener("click",(()=>{console.log("create room button clicked"),fetch("/create-room",{method:"POST",headers:{"Content-Type":"application/json"}}).then((o=>o.json())).then((o=>{o.code?window.location.href=`${window.location.origin}/join/${o.code}`:console.log("Room not found!")})).catch((o=>{console.error("Error creating room:",o)}))})),null===(e=document.getElementById("joinRoomBtn"))||void 0===e||e.addEventListener("click",(()=>{const o=document.getElementById("roomCodeInput").value;document.getElementById("errorMessage"),o?fetch(`/join/${o}`).then((e=>{if(!e.ok)return e.json();window.location.href=`${window.location.origin}/join/${o}`})).then((o=>{o&&o.error&&n(o.error)})).catch((o=>{console.error("Error:",o),n("Error checking room")})):n("Please enter a room code")}))})();
//# sourceMappingURL=home.bundle.js.map