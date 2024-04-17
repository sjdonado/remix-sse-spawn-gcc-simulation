import './index.css'

import HomePage from './pages/home'

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-12 text-3xl font-bold">Charging Simulator</h1>
      <HomePage />
    </div>
  )
}

export default App
