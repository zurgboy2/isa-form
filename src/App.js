import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormsList from './components/FormsList';
import FormView from './components/FormView';
import VerificationLanding from './components/verificationLanding';

import './styles/formsList.css';
import './styles/formsView.css';
import './styles/preview.css';
import './styles/global.css';

function App() {
  return (
    <Router basename="/isa-form">
      <div className="App">
        <Routes>
          <Route path="/" element={<FormsList />} />
          <Route path="/verify" element={<VerificationLanding />} />
          <Route path="/form/:formId" element={<FormView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;