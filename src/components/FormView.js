// FormView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormPreview from './FormPreview';
import apiCall from '../components/api';

const FormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const scriptId = "form_script";
        const action = "getPublicForm";
        const result = await apiCall(scriptId, action, { formId });
        
        if (result.form) {
          setForm(result.form);
        } else {
          throw new Error('Form not found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleSubmit = async (formValues) => {
    setSubmitStatus({ loading: true, error: null, success: false });
    
    try {
      const scriptId = "form_script";
      const action = "submitFormResponse";
      const result = await apiCall(scriptId, action, {
        'domain': window.location.origin,
        formId,
        responses: formValues
      });
  
      if (result.success) {
        setSubmitStatus({
          loading: false,
          error: null,
          success: true,
          message: "Thank you for your submission!"
        });
  
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        // Access the error message from the error property
        setSubmitStatus({
          loading: false,
          error: result.error,  // This will now get "This email has already submitted a response"
          success: false
        });
      }
    } catch (error) {
      setSubmitStatus({
        loading: false,
        error: error.message,
        success: false
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Forms List
        </button>
      </div>
    );
  }

  if (submitStatus.success) {
    return (
      <div className="success-container">
        <div className="success-message">
          <h2>Success!</h2>
          <p>{submitStatus.message}</p>
          <p>Redirecting back to forms list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-view-container">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Forms List
      </button>
      
      {form && (
        <FormPreview 
          formData={form} 
          onSubmit={handleSubmit}
          disabled={submitStatus.loading}
        />
      )}

      {submitStatus.error && (
        <div className="submit-error">
          Error submitting form: {submitStatus.error}
        </div>
      )}
    </div>
  );
};

export default FormView;