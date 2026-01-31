const API_URL = "https://10.176.30.190:8000/CDAC/texttoisl";
const AVATAR_ID = "1";

document.getElementById("play").onclick = async () => {
  const word = document.getElementById("word").value.trim();
  if (!word) return;

  const video = document.getElementById("video");
  video.src = "";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: word, avatar_id: AVATAR_ID })
  });

  const data = await res.json();
  if (data?.file?.pose_url) {
    video.src = data.file.pose_url;
  }
};
