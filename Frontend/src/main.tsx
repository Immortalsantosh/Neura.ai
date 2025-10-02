// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './Context/UserContext.tsx'
// import UserContext from './Context/UserContext.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <UserContext>
    <App />
  </UserContext>
  </BrowserRouter>
)
