import './index.css';

import HomePage from './pages/home';

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-start p-12">
      <h1 className="my-12 text-3xl font-bold">Charging Simulator</h1>
      <HomePage />
    </div>
  );
}

export default App;
