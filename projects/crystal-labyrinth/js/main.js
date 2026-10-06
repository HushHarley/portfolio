import { CrystalLabyrinthGame } from "./game.js";

function boot() {
  try {
    const game = new CrystalLabyrinthGame();
    // A small, intentional debug hook makes manual balancing and browser smoke
    // tests possible without coupling gameplay code to developer tooling.
    window.crystalLabyrinth = game;
  } catch (error) {
    console.error("Crystal Labyrinth could not start.", error);
    const app = document.getElementById("app");
    if (app) {
      const message = document.createElement("div");
      message.className = "fatal-error pixel-frame";
      message.setAttribute("role", "alert");
      message.innerHTML = "<h1>The cavern failed to form</h1><p>Reload the page to try another path. Details are available in the browser console.</p>";
      app.append(message);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
