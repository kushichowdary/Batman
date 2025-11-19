
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TotalCalculator from './pages/TotalCalculator';
import LtpsCalculator from './pages/LtpsCalculator';
import SubjectCalculator from './pages/SubjectCalculator';

function App() {
  return (
    <div className="font-sans text-text-main selection:bg-primary selection:text-white h-full">
      <Router>
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/home" element={<Home />} />
                <Route path="/total" element={<TotalCalculator />} />
                <Route path="/calbyltps" element={<LtpsCalculator />} />
                <Route path="/calc3" element={<SubjectCalculator />} />
            </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
