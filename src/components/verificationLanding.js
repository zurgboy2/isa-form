import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiCall from './api';
import '../styles/verificationLanding.css';

function VerificationLanding() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formId = searchParams.get('formId');
  const email = searchParams.get('email');
  const finalToken = searchParams.get('token');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const scriptId = "form_script";
        const result = await apiCall(scriptId, "getFormVerificationData", {
          formId,
          email,
          finalToken,
          domain: window.location.origin
        });
        
        setFormData(result);
        
        if (result.theme) {
          document.documentElement.style.setProperty('--primary-color', result.theme.primaryColor);
          document.documentElement.style.setProperty('--secondary-color', result.theme.secondaryColor);
          document.documentElement.style.setProperty('--background-color', result.theme.backgroundColor);
          document.documentElement.style.setProperty('--section-color', result.theme.sectionColor);
          if (result.theme.fontFamily) {
            document.documentElement.style.setProperty('--font-family', result.theme.fontFamily);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (formId && email && finalToken) {
      fetchFormData();
    } else {
      setError('Missing required parameters');
      setLoading(false);
    }
  }, [formId, email, finalToken]);

  const handleRevokeParticipation = async () => {
    try {
      const scriptId = "form_script";
      await apiCall(scriptId, "revokeFormParticipation", {
        formId,
        email,
        finalToken,
        domain: window.location.origin
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="verification-loading">
        <div className="loader"></div>
        <p>Loading registration status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-error">
        <h2>Status Check Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
      case 'Active':
        return 'status-success';
      case 'Pending':
      case 'Waitlist':
        return 'status-pending';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
      case 'Active':
        return '✓';
      case 'Pending':
      case 'Waitlist':
        return '⌛';
      case 'Rejected':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <div className="verification-landing">
      {formData?.theme?.logo?.url && (
        <img
          src={formData.theme.logo.url}
          alt="Form Logo"
          className="form-logo"
        />
      )}
      
      <div className="verification-content">
        <h1>{formData?.title || 'Registration Status'}</h1>
        
        {formData?.landingWelcome && (
          <div className="welcome-message">
            <p>{formData.landingWelcome}</p>
          </div>
        )}

        <div className="status-container">
          <div className="status-row">
            <div className={`status-badge ${getStatusColor(formData?.verificationStatus)}`}>
              <span className="status-icon">{getStatusIcon(formData?.verificationStatus)}</span>
              <span>Email: {email}</span>
              <span className="status-label">{formData?.verificationStatus}</span>
            </div>
          </div>

          {formData?.requireHostApproval && (
            <div className="status-row">
              <div className={`status-badge ${getStatusColor(formData?.approvalStatus)}`}>
                <span className="status-icon">{getStatusIcon(formData?.approvalStatus)}</span>
                <span>Registration Status:</span>
                <span className="status-label">{formData?.approvalStatus || 'Pending'}</span>
              </div>
            </div>
          )}

          {formData?.guestCountStatus && (
            <div className="status-row">
              <div className={`status-badge ${getStatusColor(formData?.guestCountStatus)}`}>
                <span className="status-icon">{getStatusIcon(formData?.guestCountStatus)}</span>
                <span>Guest Status:</span>
                <span className="status-label">{formData?.guestCountStatus}</span>
              </div>
            </div>
          )}
        </div>

        {formData?.landingInstructions && (
          <div className="instructions">
            <h3>Additional Information</h3>
            <p>{formData.landingInstructions}</p>
          </div>
        )}

        {formData?.description && (
          <div className="form-description">
            <p>{formData.description}</p>
          </div>
        )}
      
        <div className="actions">
          <button 
            className="primary-button"
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
          <button 
            className="secondary-button"
            onClick={handleRevokeParticipation}
          >
            Revoke Participation
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationLanding;