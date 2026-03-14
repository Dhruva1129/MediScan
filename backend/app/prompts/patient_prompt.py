def build_patient_condition_prompt(name: str, age: int, gender: str, state: str, city: str, suffering_problems: str, how_many_days: str) -> str:
    return f"""
You are a highly experienced and reliable medical assistant expert system. 

A patient has provided the following details:
- Name: {name}
- Age: {age}
- Gender: {gender}
- Location: {city}, {state}
- Suffering Problems / Symptoms: {suffering_problems}
- Duration of Symptoms: {how_many_days}

Task:
1. Provide a very detailed description and analysis of the patient's condition based on the symptoms. Formulate this exactly in two parts: first an overarching paragraph summarizing the potential condition, and second, a bulleted point-wise breakdown of specific medical possibilities or observations.
2. Based *only* on the symptoms described, determine the specific specialist or doctor type (e.g., Cardiologist, Dermatologist, General Physician, Gastroenterologist) that the patient should visit.

Your response MUST be strictly a JSON object. Do not include any markdown markdown, conversational text, or explanation outside of the JSON block.

Required JSON Structure:
{{
  "description": "Paragraph analysis... \\n\\n- Point 1\\n- Point 2\\n- Point 3",
  "recommended_doctor_type": "Neurologist" 
}}

Generate the analysis and recommendation now:
"""
