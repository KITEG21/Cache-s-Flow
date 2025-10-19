import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage'
import TutorialPage from './pages/TutorialPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
      </Routes>
    </Router>
  )
}

export default App
