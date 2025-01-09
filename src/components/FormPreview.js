import React, { useState } from 'react';
import { CONDITION_CODES, MULTI_VALUE_PREFIX, RANGE_PREFIX } from './conditionCodes';

const FormPreview = ({ formData, onSubmit = null, disabled = false }) => {
  // State to track all form values
  const [formValues, setFormValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Add CSS variables for theme colors
  const previewStyles = {
    '--primary-color': formData.metadata.theme.primaryColor,
    '--secondary-color': formData.metadata.theme.secondaryColor,
    '--background-color': formData.metadata.theme.backgroundColor,
    '--section-color': formData.metadata.theme.sectionColor,
    '--question-color': formData.metadata.theme.questionColor,
    '--font-family': formData.metadata.theme.fontFamily || 'inherit',
  };

  const handleInputChange = (questionId, value) => {
    setFormValues(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    formData.sections.forEach(section => {
      if (checkVisibility(section.showWhen)) {
        section.questions.forEach(question => {
          if (checkVisibility(question.showWhen) && question.required) {
            const value = formValues[question.id];
            if (!value || 
                (Array.isArray(value) && value.length === 0) || 
                value === '') {
              errors[question.id] = 'This field is required';
              isValid = false;
            }
          }
        });
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {  // Only call onSubmit if it's provided
      if (validateForm()) {
        onSubmit(formValues);
      }
    }
  };

  const validateEmail = (email) => {
    if (!email) return false;
    if (formData.metadata.allowedEmailDomain) {
      return email.endsWith(`@${formData.metadata.allowedEmailDomain}`);
    }
    // Basic email validation regex if no domain restriction
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkVisibility = (showWhen) => {
    if (!showWhen || !showWhen.questionId) return true;
    
    const value = formValues[showWhen.questionId];
    const condition = showWhen.equals;

    if (!condition) return true;

    // Handle special conditions
    if (condition.startsWith(MULTI_VALUE_PREFIX)) {
      const acceptedValues = condition.replace(MULTI_VALUE_PREFIX, '').split(',').map(v => v.trim());
      return acceptedValues.includes(value);
    }

    if (condition.startsWith(RANGE_PREFIX)) {
      const [min, max] = condition.replace(RANGE_PREFIX, '').split('-').map(Number);
      const numValue = Number(value);
      return numValue >= min && numValue <= max;
    }

    switch (condition) {
      case CONDITION_CODES.ANY:
        return value !== undefined && value !== null;
      case CONDITION_CODES.NONE:
        return value === undefined || value === null;
      case CONDITION_CODES.NOT_EMPTY:
        return value !== undefined && value !== null && value !== '';
      case CONDITION_CODES.IS_EMPTY:
        return value === undefined || value === null || value === '';
      case CONDITION_CODES.TRUE:
        return value === true || value === 'true' || value === 'yes' || value === 'checked';
      case CONDITION_CODES.FALSE:
        return value === false || value === 'false' || value === 'no' || value === 'unchecked';
      default:
        return value === condition;
    }
  };

  const renderQuestion = (question) => {
    const hasError = validationErrors[question.id];
    const commonProps = {
      disabled: disabled,
      className: `preview-input ${hasError ? 'has-error' : ''}`,
      'aria-invalid': hasError ? 'true' : 'false'
    };

    const errorMessage = hasError && (
      <div className="error-message">{validationErrors[question.id]}</div>
    );

    switch (question.type) {
      case 'text':
        return (
          <>
            <input
              type="text"
              placeholder="Your answer"
              value={formValues[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              {...commonProps}
            />
            {errorMessage}
          </>
        );
      
      case 'number':
        return (
          <>
            <input
              type="number"
              placeholder="0"
              value={formValues[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              {...commonProps}
            />
            {errorMessage}
          </>
        );
      
      case 'select':
        return (
          <>
            <select 
              value={formValues[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`preview-select ${hasError ? 'has-error' : ''}`}
              disabled={disabled}
            >
              <option value="">Select an option</option>
              {(question.options || []).map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errorMessage}
          </>
        );
      
      case 'radio':
        return (
          <>
            <div className="preview-radio-group">
              {(question.options || []).map((option, idx) => (
                <label key={idx} className="preview-radio-label">
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    value={option.value}
                    checked={formValues[question.id] === option.value}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    disabled={disabled}
                    className="preview-radio"
                  />
                  <span className="preview-radio-text">{option.label}</span>
                </label>
              ))}
            </div>
            {errorMessage}
          </>
        );
      
      case 'checkbox':
        return (
          <>
            <div className="preview-checkbox-group">
              {(question.options || []).map((option, idx) => (
                <label key={idx} className="preview-checkbox-label">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(formValues[question.id]) && 
                            formValues[question.id].includes(option.value)}
                    onChange={(e) => {
                      const currentValues = formValues[question.id] || [];
                      const newValues = e.target.checked 
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      handleInputChange(question.id, newValues);
                    }}
                    disabled={disabled}
                    className="preview-checkbox"
                  />
                  <span className="preview-checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
            {errorMessage}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-preview" style={previewStyles}>
      <div className="preview-header">
        <h2 style={{ color: formData.metadata.theme.primaryColor }}>
          {formData.metadata.title || "Untitled Form"}
        </h2>
        <p className="preview-description">{formData.metadata.description}</p>
      </div>


      {formData.metadata.requireEmail && (
        <div className="preview-section email-section">
          <div className="preview-question">
            <label className="preview-question-label">
              Email Address
              <span className="required">*</span>
            </label>
            {formData.metadata.allowedEmailDomain && (
              <p className="preview-question-description">
                Please use your {formData.metadata.allowedEmailDomain} email address
              </p>
            )}
            <div className="email-input-container">
              <input
                type="email"
                placeholder={formData.metadata.allowedEmailDomain 
                  ? `username@${formData.metadata.allowedEmailDomain}`
                  : "your.email@example.com"
                }
                value={formValues['email'] || ''}
                onChange={(e) => {
                  handleInputChange('email', e.target.value);
                }}
                className={`preview-input ${
                  formValues['email'] && !validateEmail(formValues['email']) 
                    ? 'invalid-email' 
                    : ''
                }`}
              />
              {formValues['email'] && !validateEmail(formValues['email']) && (
                <p className="email-error">
                  {formData.metadata.allowedEmailDomain
                    ? `Email must end with @${formData.metadata.allowedEmailDomain}`
                    : 'Please enter a valid email address'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {formData.sections.map((section, sectionIdx) => (
        checkVisibility(section.showWhen) && (
          <div key={sectionIdx} className="preview-section">
            <h3 style={{ color: formData.metadata.theme.secondaryColor }}>
              {section.title || `Section ${sectionIdx + 1}`}
            </h3>
            <p className="preview-section-description">{section.description}</p>
            
            <div className="preview-questions">
              {section.questions.map((question, questionIdx) => (
                checkVisibility(question.showWhen) && (
                  <div key={questionIdx} className="preview-question">
                    <label className="preview-question-label">
                      {question.question}
                      {question.required && <span className="required">*</span>}
                    </label>
                    {question.description && (
                      <p className="preview-question-description">
                        {question.description}
                      </p>
                    )}
                    {renderQuestion(question)}
                  </div>
                )
              ))}
            </div>
          </div>
        )
      ))}

      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-button"
          disabled={disabled}
        >
          {disabled ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default FormPreview;