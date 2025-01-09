import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from './api';

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchForms = async () => {
    try {
      const scriptId = "form_script";
      const action = "getPublicForms"; // Changed to a public endpoint
      const result = await apiCall(scriptId, action);
      
      if (result.forms) {
        setForms(result.forms);
      } else {
        throw new Error('No forms available');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  if (loading) {
    return <div className="loading">Loading available forms...</div>;
  }

  return (
    <div className="forms-list-container">
      <h1>Available Forms</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="forms-grid">
        {forms.length === 0 ? (
          <div className="no-forms">No forms are currently available</div>
        ) : (
          forms.map((form) => (
            <div 
              key={form.id} 
              className="form-card"
              onClick={() => navigate(`/form/${form.id}`)}
            >
              <div className="form-card-content">
                <h3>{form.metadata.title || 'Untitled Form'}</h3>
                <p className="form-description">
                  {form.metadata.description || 'No description available'}
                </p>
                {form.metadata.author && (
                  <div className="form-meta">
                    <span>Created by: {form.metadata.author}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormsList;