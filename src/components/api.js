const handleApiError = (error, response) => {
  console.error('API call failed:', error);
  if (response) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  } else if (error.request) {
    throw new Error('No response from server');
  } else {
    throw new Error('Error setting up request');
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000, forceNoRetry = false) => {
  if (forceNoRetry) return fn();
  
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      const delayTime = initialDelay * Math.pow(2, retries - 1);
      console.log(`Attempt ${retries} failed. Retrying in ${delayTime}ms...`);
      await delay(delayTime);
    }
  }
};

const apiCall = async (scriptId, action, additionalData = {}) => {
  const noRetry = scriptId === 'admin_tournament_script' && action === 'createEvent';
  const makeRequest = async () => {
    const proxyAuthToken = await getProxyToken(scriptId, action);
    const url = new URL('https://proxy-server-main-b19c53126a4f.herokuapp.com/proxy');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        token: proxyAuthToken,  
        action, 
        script_id: scriptId, 
        ...additionalData 
      })
    }, 180000);

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(new Error(errorText), response);
    }
    return await response.json();
  };

  return retryWithBackoff(makeRequest, 5, 2000, noRetry);
};

const fetchWithTimeout = async (url, options, timeout = 120000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const getProxyToken = async (scriptId, action) => {
  const makeRequest = async () => {
    const url = new URL('https://proxy-server-main-b19c53126a4f.herokuapp.com/get_token');
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        script_id: scriptId, 
        action: action,
      })
    }, 60000);

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(new Error(errorText), response);
    }

    const data = await response.json();
    if (data.token) return data.token;
    throw new Error('Failed to get token: ' + JSON.stringify(data));
  };

  return retryWithBackoff(makeRequest);
};

export default apiCall;