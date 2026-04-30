import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './Inicio'
import Admin from './Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Cuando el usuario entre a la ruta principal "/", le mostramos Inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Cuando tú entres a la ruta "/admin", te mostramos el panel */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App