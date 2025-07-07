import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)

function applyScale() {
  const inner = document.getElementById("scaler-inner");
  if (!inner) return;
  const scale = Math.min(
    window.innerWidth / 1280,
    window.innerHeight / 720
  );
  inner.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", applyScale);
window.addEventListener("load", applyScale);