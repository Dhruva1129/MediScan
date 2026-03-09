const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (username, password) => {
    const fd = new FormData()
    fd.append('username', username)
    fd.append('password', password)
    return request('/login/', { method: 'POST', body: fd })
  },

  signup: (username, email, password) => {
    const fd = new FormData()
    fd.append('username', username)
    fd.append('email', email)
    fd.append('password', password)
    return request('/signup/', { method: 'POST', body: fd })
  },

  // Summaries
  analyzeImage: (file, prompt, userId) => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('prompt', prompt)
    fd.append('user_id', userId)
    return request('/summarize-image/', { method: 'POST', body: fd })
  },

  getUserSummaries: (userId) => request(`/user-summaries/${userId}`),

  deleteSummary: (summaryId) =>
    request(`/user-summaries/${summaryId}`, { method: 'DELETE' }),

  getSummaryResponse: (id) => request(`/summary-response/${id}`),
  getRiskResponse: (id) => request(`/risk-response/${id}`),
  getNextStepResponse: (id) => request(`/next-step-response/${id}`),
  getAskDoctorResponse: (id) => request(`/ask-docter-response/${id}`),

  // Followup
  followup: (summaryId, userText, userId, sessionId = null) => {
    const fd = new FormData()
    fd.append('summary_id', summaryId)
    fd.append('user_text', userText)
    fd.append('user_id', userId)
    if (sessionId) fd.append('session_id', sessionId)
    return request('/followup/', { method: 'POST', body: fd })
  },

  getFollowups: (summaryId) => request(`/followups/${summaryId}`),

  // Translate
  translateSummary: (summaryId, userId, language) =>
    request('/translate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary_id: summaryId, user_id: userId, language }),
    }),

  // Graphics
  generateGraphics: (summaryId, userId, patientName, patientAge, patientWeight, patientGender) =>
    request('/generate-graphics/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary_id: summaryId,
        user_id: userId,
        patient_name: patientName,
        patient_age: patientAge,
        patient_weight: patientWeight,
        patient_gender: patientGender,
      }),
    }),

  getGraphics: (graphicsId) => request(`/graphics/${graphicsId}`),

  getGraphicsBySummary: (summaryId, userId) =>
    request(`/graphics-by-summary?summary_id=${summaryId}&user_id=${userId}`),
}
