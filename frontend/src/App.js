import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
// Tit Albert game components
import TitAlbertSetup from './games/tit-albert/components/TitAlbertSetup';
import TitAlbertJoin from './games/tit-albert/components/JoinGame';
import './App.css';

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Main hub */}
          <Route path="/" element={<MainMenu />} />
          
          {/* Tit Albert game routes */}
          <Route path="/games/tit-albert/setup" element={<TitAlbertSetup />} />
          <Route path="/games/tit-albert/join" element={<TitAlbertJoin />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/TiAlbertSetup" element={<TitAlbertSetup />} />
          <Route path="/join" element={<TitAlbertJoin />} />
          
          {/* Future game routes will go here */}
          {/* <Route path="/games/mafia/setup" element={<MafiaSetup />} /> */}
          {/* <Route path="/games/mafia/join" element={<MafiaJoin />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;