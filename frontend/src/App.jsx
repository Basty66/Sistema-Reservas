import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import SplashScreen from './components/SplashScreen'
import Inicio from './Inicio'
import Admin from './Admin'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.src = '/hero_oasis_1777577991129.png'
  }, [])

  return (
    <>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      <div className={`transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <BrowserRouter>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </ToastProvider>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
