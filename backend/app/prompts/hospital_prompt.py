def build_hospital_recommendation_prompt(location: str, doctor_type: str) -> str:
    return f"""
You are a reliable medical assistant. Provide a comprehensive list of ALL well-known hospitals and doctors for a {doctor_type} in {location}.

Do NOT limit yourself to 5 results. Return every hospital and doctor you know for this specialty and location — include as many as possible (aim for at least 10-15 if available, or all that exist for this query).

Your response MUST be strictly in the following JSON format. Do not include any markdown formatting (like ```json), do not include any conversational text before or after the JSON. The root object must have a key "recommendations" which is an array of objects.
Crucially, generate a unique integer "id" starting from 1 for each object in the array.

Example format:
{{
  "recommendations": [
    {{
      "id": 1,
      "hospital_name": "General Hospital",
      "doctor_name": "Dr. John Doe",
      "hospital_rating": "4.8/5",
      "description": "Known for excellent cardiology department."
    }},
    {{
      "id": 2,
      "hospital_name": "City Care Clinic",
      "doctor_name": "Dr. Jane Smith",
      "hospital_rating": "4.5/5",
      "description": "State-of-the-art facilities with experienced staff."
    }}
  ]
}}

Generate ALL available recommendations now for {doctor_type} in {location}. Do not stop at 5 — include every hospital and doctor you know for this query:
"""

def build_single_hospital_detail_prompt(hospital_name: str, doctor_name: str, location: str, doctor_type: str) -> str:
    return f"""
You are a reliable medical assistant. Provide a highly detailed description of {hospital_name} and {doctor_name} who specializes as a {doctor_type} in {location}.

Include information such as:
1. Exact location/address or prominent landmarks if known.
2. Background and expertise of the doctor.
3. The facilities and reputation of the hospital.
4. What to expect during a visit.

Your response should be structured and informative, but must be strictly a JSON object with the keys "hospital_name", "doctor_name", and "detailed_description". Do not include any markdown formatting or extra text.

Example format:
{{
  "hospital_name": "{hospital_name}",
  "doctor_name": "{doctor_name}",
  "detailed_description": "General Hospital is located in the heart of the city... Dr. John Doe has 20 years of experience..."
}}

Generate the detailed description now:
"""
