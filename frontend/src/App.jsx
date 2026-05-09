import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Inicio from './Inicio'
import Admin from './Admin'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
