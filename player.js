document.addEventListener("DOMContentLoaded", () => {
  const url = decodeURIComponent(window.location.hash.substring(1));
  const iframe = document.getElementById("video");
  if (iframe && url) iframe.src = url;
});
