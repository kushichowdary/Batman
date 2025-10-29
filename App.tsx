
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TotalCalculator from './pages/TotalCalculator';
import LtpsCalculator from './pages/LtpsCalculator';
import SubjectCalculator from './pages/SubjectCalculator';

function App() {
  return (
    <div className="font-sans text-light-text selection:bg-primary selection:text-white">
      <div className="text-center p-2 bg-accent-dark">
        <h3 className="text-primary inline-block m-0 text-lg font-semibold">Attendance Calculator</h3>
        <h3 className="text-accent inline-block m-0 ml-2 text-lg font-semibold">-KLU</h3>
      </div>
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
