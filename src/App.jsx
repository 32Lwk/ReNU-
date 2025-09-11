import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Game from './pages/Game'
import Rankings from './pages/Rankings'
import Admin from './pages/Admin'
import HowToPlay from './pages/HowToPlay'
import Settings from './pages/Settings'

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </GameProvider>
    </ErrorBoundary>
  )
}

export default App
