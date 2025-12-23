import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Droplets, User, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FullNavigationBar from '../components/FullNavigationBar';
import SymptomInput from "../components/SymptomInput";

interface SinglePrediction {
  disease: string;
  confidence: number;
}

interface ModelPrediction {
  disease: string;
  confidence: number;
  top_predictions?: SinglePrediction[];
}

interface PredictionResult {
  predicted_disease: string;
  confidence: number;
  all_predictions: {
    [key: string]: ModelPrediction;
  };
}

interface BackendPrediction {
  prediction: string;
  confidence: number;
  top_predictions?: SinglePrediction[];
}

interface BackendResponse {
  result: {
    [key: string]: BackendPrediction;
  };
  error?: string;
}

interface FormData {
  symptoms: string;
  age: string;
  gender: string;
  severity: string;
  temperature: string;
  heart_rate: string;
  blood_pressure: string;
  oxygen_saturation: string;
}

const DISEASE_SYMPTOMS: Record<string, string[]> = {
  "Addison's Disease": ["fatigue", "muscle weakness", "nausea", "weight loss"],
  "Allergic Reaction": ["itching", "nausea", "rash", "shortness of breath", "swelling"],
  "Alzheimer's Disease": ["confusion", "fatigue", "memory loss", "mood changes"],
  "Anemia": ["dizziness", "fatigue", "pale skin", "shortness of breath", "weakness"],
  "Anxiety Disorder": ["chest pain", "dizziness", "rapid heartbeat", "shortness of breath"],
  "Appendicitis": ["abdominal pain", "fever", "nausea", "vomiting"],
  "Arrhythmia": ["chest pain", "dizziness", "palpitations", "shortness of breath"],
  "Arthritis": ["body pain", "fatigue", "joint pain", "stiffness"],
  "Asthma": ["chest tightness", "cough", "shortness of breath", "wheezing"],
  "Bladder Infection": ["abdominal pain", "burning sensation", "fever", "frequent urination"],
  "Bronchitis": ["chest pain", "cough", "fatigue", "mucus production"],
  "COPD": ["chest tightness", "cough", "fatigue", "shortness of breath", "wheezing"],
  "COVID-19": ["cough", "fatigue", "fever", "loss of taste", "shortness of breath"],
  "Chikungunya": ["fever", "headache", "joint pain", "rash"],
  "Chronic Fatigue Syndrome": ["body pain", "concentration problems", "fatigue", "headache", "sleep problems"],
  "Concussion": ["confusion", "dizziness", "fatigue", "headache", "nausea"],
  "Crohn's Disease": ["abdominal pain", "diarrhea", "fatigue", "fever", "weight loss"],
  "Cushing's Syndrome": ["fatigue", "mood changes", "muscle weakness", "weight gain"],
  "Dehydration": ["dizziness", "dry mouth", "fatigue", "headache", "weakness"],
  "Dengue": ["body pain", "fever", "headache", "joint pain", "rash"],
  "Depression": ["fatigue", "headache", "loss of appetite", "mood changes", "sleep problems"],
  "Diabetes": ["blurred vision", "fatigue", "frequent urination", "thirst", "weight loss"],
  "Encephalitis": ["confusion", "fever", "headache", "nausea", "seizures"],
  "Epilepsy": ["confusion", "fatigue", "headache", "seizures"],
  "Fibromyalgia": ["body pain", "fatigue", "headache", "sleep problems"],
  "Food Poisoning": ["abdominal pain", "diarrhea", "fever", "nausea", "vomiting"],
  "GERD": ["chest pain", "cough", "heartburn", "sore throat"],
  "Gallstones": ["abdominal pain", "fever", "nausea", "vomiting"],
  "Gastroenteritis": ["abdominal pain", "diarrhea", "fever", "nausea", "vomiting"],
  "Gout": ["fever", "joint pain", "redness", "swelling"],
  "Heart Attack": ["chest pain", "fatigue", "nausea", "shortness of breath", "sweating"],
  "Heart Disease": ["chest pain", "fatigue", "palpitations", "shortness of breath"],
  "Heart Failure": ["chest pain", "fatigue", "shortness of breath", "swelling"],
  "Heat Exhaustion": ["dizziness", "excessive sweating", "fatigue", "headache", "nausea"],
  "Hepatitis": ["abdominal pain", "fatigue", "jaundice", "loss of appetite", "nausea"],
  "Hypertension": ["blurred vision", "chest pain", "dizziness", "headache"],
  "Hyperthyroidism": ["diarrhea", "fatigue", "rapid heartbeat", "sweating", "weight loss"],
  "Hypothyroidism": ["cold intolerance", "constipation", "fatigue", "weight gain"],
  "IBS": ["abdominal pain", "bloating", "diarrhea", "nausea"],
  "Inflammatory Bowel Disease": ["abdominal pain", "diarrhea", "fatigue", "weight loss"],
  "Influenza": ["body pain", "chills", "cough", "fever", "headache"],
  "Iron Deficiency": ["fatigue", "pale skin", "shortness of breath", "weakness"],
  "Kidney Disease": ["fatigue", "loss of appetite", "nausea", "shortness of breath", "swelling"],
  "Kidney Stones": ["abdominal pain", "frequent urination", "nausea", "vomiting"],
  "Leukemia": ["easy bruising", "fatigue", "fever", "frequent infections", "weight loss"],
  "Liver Cirrhosis": ["abdominal pain", "fatigue", "jaundice", "nausea", "swelling"],
  "Lung Cancer": ["chest pain", "cough", "fatigue", "shortness of breath", "weight loss"],
  "Lupus": ["fatigue", "fever", "hair loss", "joint pain", "rash"],
  "Lymphoma": ["fatigue", "fever", "night sweats", "swollen lymph nodes", "weight loss"],
  "Malaria": ["body pain", "chills", "fever", "headache", "nausea"],
  "Meningitis": ["confusion", "fever", "headache", "nausea", "neck stiffness"],
  "Migraine": ["blurred vision", "headache", "nausea", "sensitivity to light"],
  "Mononucleosis": ["fatigue", "fever", "sore throat", "swollen glands"],
  "Multiple Sclerosis": ["blurred vision", "dizziness", "fatigue", "weakness"],
  "Osteoarthritis": ["body pain", "fatigue", "joint pain", "stiffness"],
  "Osteoporosis": ["back pain", "bone fractures", "fatigue", "loss of height"],
  "Panic Disorder": ["chest pain", "dizziness", "rapid heartbeat", "shortness of breath", "sweating"],
  "Parkinson's Disease": ["difficulty walking", "fatigue", "stiffness", "tremor"],
  "Peptic Ulcer": ["abdominal pain", "heartburn", "loss of appetite", "nausea"],
  "Pharyngitis": ["cough", "fever", "headache", "sore throat"],
  "Pleurisy": ["chest pain", "cough", "fever", "shortness of breath"],
  "Pneumocystis Pneumonia": ["chest pain", "cough", "fever", "shortness of breath"],
  "Pneumonia": ["chest pain", "chills", "cough", "fever", "shortness of breath"],
  "Pneumothorax": ["chest pain", "cough", "rapid breathing", "shortness of breath"],
  "Psoriasis": ["fatigue", "itching", "joint pain", "skin rash"],
  "Rheumatoid Arthritis": ["body pain", "fatigue", "joint pain", "stiffness", "swelling"],
  "Sepsis": ["confusion", "fatigue", "fever", "rapid heartbeat", "shortness of breath"],
  "Sinusitis": ["congestion", "cough", "facial pain", "headache", "sore throat"],
  "Sleep Apnea": ["difficulty concentrating", "fatigue", "headache", "snoring"],
  "Strep Throat": ["fever", "headache", "sore throat", "swollen glands"],
  "Stroke": ["blurred vision", "confusion", "dizziness", "headache", "weakness"],
  "Tension Headache": ["fatigue", "headache", "irritability", "neck pain"],
  "Tonsillitis": ["difficulty swallowing", "fever", "headache", "sore throat"],
  "Tuberculosis": ["chest pain", "cough", "fever", "night sweats", "weight loss"],
  "Typhoid": ["abdominal pain", "diarrhea", "fever", "headache", "weakness"],
  "Ulcerative Colitis": ["abdominal pain", "diarrhea", "rectal bleeding", "weight loss"],
  "Urinary Tract Infection": ["abdominal pain", "fever", "frequent urination", "nausea"],
  "Vertigo": ["balance problems", "dizziness", "nausea", "vomiting"],
  "Vitamin D Deficiency": ["bone pain", "fatigue", "mood changes", "muscle weakness"]
};

const HealthDiagnosis: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    symptoms: '',
    age: '',
    gender: '',
    severity: '',
    temperature: '',
    heart_rate: '',
    blood_pressure: '',
    oxygen_saturation: ''
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tempError, setTempError] = useState<string | null>(null);
  const [heartRateError, setHeartRateError] = useState<string | null>(null);
  const [bpError, setBpError] = useState<string | null>(null);
  const [oxygenSatError, setOxygenSatError] = useState<string | null>(null);
  const [symptomsError, setSymptomsError] = useState<string | null>(null);
  const [refineSymptoms, setRefineSymptoms] = useState<string[]>([]);
  const [refineLoading, setRefineLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'symptoms') setSymptomsError(null);

    if (name === 'temperature') {
      const temp = parseFloat(value);
      setTempError(value === '' ? null : isNaN(temp) || temp < 95 || temp > 107 ? 'Temperature must be between 95°F and 107°F' : null);
    } else if (name === 'heart_rate') {
      const hr = parseInt(value, 10);
      setHeartRateError(value === '' ? null : isNaN(hr) || hr < 30 || hr > 220 ? 'Heart rate must be between 30 and 220 bpm' : null);
    } else if (name === 'blood_pressure') {
      if (value === '') setBpError(null);
      else {
        const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
        if (!match) setBpError('Blood pressure must be in format "Systolic/Diastolic" (e.g., 120/80)');
        else {
          const sys = parseInt(match[1], 10);
          const dia = parseInt(match[2], 10);
          setBpError(sys < 70 || sys > 250 || dia < 40 || dia > 140 ? 'Blood pressure values are out of valid range' : null);
        }
      }
    } else if (name === 'oxygen_saturation') {
      const ox = parseInt(value, 10);
      setOxygenSatError(value === '' ? null : isNaN(ox) || ox < 80 || ox > 100 ? 'Oxygen saturation must be between 80% and 100%' : null);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = () =>
    formData.symptoms.trim() !== '' &&
    formData.age.trim() !== '' &&
    formData.gender.trim() !== '' &&
    formData.severity.trim() !== '' &&
    formData.temperature.trim() !== '' &&
    formData.heart_rate.trim() !== '' &&
    formData.blood_pressure.trim() !== '' &&
    formData.oxygen_saturation.trim() !== '' &&
    !tempError &&
    !heartRateError &&
    !bpError &&
    !oxygenSatError;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSymptomsError(null);
    setPrediction(null);

    if (!isFormValid()) {
      setError('Please fill in all required fields with valid values before getting diagnosis.');
      setLoading(false);
      return;
    }

    const allowedSymptoms = [
      "abdominal pain","back pain","balance problems","bloating","blurred vision","body pain",
      "bone fractures","bone pain","burning sensation","chest pain","chest tightness","chills",
      "cold","concentration problems","confusion","congestion","constipation","cough",
      "diarrhea","difficulty concentrating","difficulty swallowing","difficulty walking","dizziness",
      "dry mouth","easy bruising","excessive sweating","facial pain","fatigue","fever",
      "frequent infections","frequent urination","hair loss","headache","heartburn","irritability",
      "itching","jaundice","joint pain","loss of appetite","loss of height","loss of taste",
      "memory loss","mood changes","mucus production","muscle weakness","nausea","neck pain",
      "neck stiffness","night sweats","pale skin","palpitations","rapid breathing","rapid heartbeat",
      "rash","rectal bleeding","redness","seizures","sensitivity to light","shortness of breath",
      "skin rash","sleep problems","snoring","sore throat","stiffness","sweating","swelling",
      "swollen glands","swollen lymph nodes","thirst","tremor","vomiting","weakness","weight gain",
      "weight loss","wheezing"
    ];

    const inputSymptoms = formData.symptoms.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const invalidSymptoms = inputSymptoms.filter(s => !allowedSymptoms.includes(s));

    if (invalidSymptoms.length > 0) {
      setSymptomsError(`Invalid symptom(s): ${invalidSymptoms.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // ✅ Use env variable for production, fallback for safety
      const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      
      const payload = {
  symptoms: formData.symptoms.trim(),   // ✅ STRING (CRITICAL)
  blood_pressure: formData.blood_pressure.trim(),
  heart_rate: Number(formData.heart_rate),
  age: Number(formData.age),
  temperature: Number(formData.temperature),
  oxygen_saturation: Number(formData.oxygen_saturation)
};


      console.log("Sending payload:", payload);

      const response = await fetch(`${backendBaseUrl}/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}` // ✅ Included Token
        },
        body: JSON.stringify(payload),
      });

      let result: BackendResponse | null = null;
      try { 
        result = await response.json(); 
      } catch { 
        throw new Error(`Server returned status ${response.status} and non-JSON response`); 
      }

      if (!response.ok) throw new Error(result?.error || 'Failed to get prediction');

      const backendPredictions = result.result || {};
      const firstModelKey = Object.keys(backendPredictions)[0] || '';

      const transformedPrediction: PredictionResult = {
        predicted_disease: firstModelKey ? backendPredictions[firstModelKey].prediction : '',
        confidence: firstModelKey ? backendPredictions[firstModelKey].confidence : 0,
        all_predictions: {},
      };

      for (const [model, pred] of Object.entries(backendPredictions)) {
        transformedPrediction.all_predictions[model] = {
          disease: pred.prediction,
          confidence: pred.confidence,
          top_predictions: pred.top_predictions || undefined,
        };
      }

      setPrediction(transformedPrediction);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      symptoms: '',
      age: '',
      gender: '',
      severity: '',
      temperature: '',
      heart_rate: '',
      blood_pressure: '',
      oxygen_saturation: ''
    });
    setPrediction(null);
    setError(null);
    setSymptomsError(null);
    setRefineSymptoms([]);
  };

  const navigateToTreatment = () => {
    if (!prediction) return;
    navigate('/treatment-planner', {
      state: {
        disease: prediction.predicted_disease,
        age: formData.age,
        symptoms: formData.symptoms,
      },
    });
  };

  const handleRePredict = async () => {
    if (!prediction) return;

    setRefineLoading(true);
    setError(null);

    try {
      // ✅ Use env variable
      const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

      const payload = {
        symptoms: (
          formData.symptoms +
          (refineSymptoms.length ? `, ${refineSymptoms.join(", ")}` : "")
        )
          .split(",")
          .map(s => s.trim())
          .filter(Boolean),

        selected_symptoms: refineSymptoms,

        // Extract Top 3 from existing predictions
        top_diseases: Object.values(prediction.all_predictions || {})
          .flatMap(p => p.top_predictions || [])
          .map(tp => tp.disease)
          .slice(0, 3),

        blood_pressure: formData.blood_pressure,
        heart_rate: Number(formData.heart_rate),
        age: Number(formData.age),
        temperature: Number(formData.temperature),
        oxygen_saturation: Number(formData.oxygen_saturation),

        model: "ensemble"
      };

      const response = await fetch(`${backendBaseUrl}/repredict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const result: BackendResponse = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Re-predict failed");
      }

      // ✅ Parse result same as /predict
      const backendPredictions = result.result || {};
      const firstModelKey = Object.keys(backendPredictions)[0];

      if (!firstModelKey) {
        throw new Error("No predictions returned from repredict");
      }

      const transformedPrediction: PredictionResult = {
        predicted_disease: backendPredictions[firstModelKey].prediction,
        confidence: backendPredictions[firstModelKey].confidence,
        all_predictions: {}
      };

      for (const [model, pred] of Object.entries(backendPredictions)) {
        transformedPrediction.all_predictions[model] = {
          disease: pred.prediction,
          confidence: pred.confidence,
          top_predictions: pred.top_predictions
        };
      }

      setPrediction(transformedPrediction);
      setRefineSymptoms([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRefineLoading(false);
    }
  };

  return (
    <>
      <FullNavigationBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Diagnosis AI</h1>
            <p className="text-lg text-gray-600">Advanced ML-powered health diagnosis system</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Patient Information
              </h2>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms
                  </label>
                  <SymptomInput formData={formData} setFormData={setFormData} />
                  {symptomsError && (
                    <p className="text-red-500 text-sm mt-1">{symptomsError}</p>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptom Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Severity</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                {/* Vital Signs */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    Vital Signs
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Thermometer className="w-4 h-4 mr-1" />
                        Temperature (°F)
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        step="0.1"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          tempError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="98.6"
                        required
                      />
                      {tempError && <p className="text-red-500 text-sm mt-1">{tempError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        name="heart_rate"
                        value={formData.heart_rate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          heartRateError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="72"
                        required
                      />
                      {heartRateError && <p className="text-red-500 text-sm mt-1">{heartRateError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure
                      </label>
                      <input
                        type="text"
                        name="blood_pressure"
                        value={formData.blood_pressure}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          bpError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="120/80"
                        required
                      />
                      {bpError && <p className="text-red-500 text-sm mt-1">{bpError}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Droplets className="w-4 h-4 mr-1" />
                        Oxygen Saturation (%)
                      </label>
                      <input
                        type="number"
                        name="oxygen_saturation"
                        value={formData.oxygen_saturation}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          oxygenSatError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="98"
                        min="80"
                        max="100"
                        required
                      />
                      {oxygenSatError && <p className="text-red-500 text-sm mt-1">{oxygenSatError}</p>}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isFormValid()}
                    className={`flex-1 py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center ${
                      loading || !isFormValid() 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5 mr-2" />
                        Get Diagnosis
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                Diagnosis Results
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {prediction && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-medium">Primary Diagnosis</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800 mb-2 text-center">
                      {prediction.predicted_disease}
                    </div>
                    <div className="text-sm text-green-600 text-center mb-4">
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-center">
                      <button
                        onClick={navigateToTreatment}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md shadow"
                      >
                        Generate Treatment Plan for {prediction.predicted_disease}
                      </button>
                    </div>
                  </div>

                  {prediction.all_predictions && Object.keys(prediction.all_predictions).length > 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="font-medium text-blue-800 mb-3">All Model Predictions:</h4>
                      <div className="space-y-3">
                        {Object.entries(prediction.all_predictions).map(([model, pred]) => (
                          <div key={model} className="bg-white p-3 rounded shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600 capitalize">{model} Model:</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{pred.disease}</div>
                                <div className="text-xs text-gray-500">{(pred.confidence * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                            {/* Top predictions rendering */}
                            {pred.top_predictions && pred.top_predictions.length > 0 && (
                              <div className="mt-2">
                                <h5 className="text-xs font-medium text-gray-600 mb-1">Top Predictions:</h5>
                                <ul className="list-disc list-inside text-xs text-gray-700 pl-2 space-y-1">
                                  {pred.top_predictions.map((item, index) => (
                                    <li key={index}>
                                      {item.disease} – {(item.confidence * 100).toFixed(1)}%
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refine Prediction Section */}
                  {prediction && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h4 className="font-medium text-gray-800 mb-3">Refine Prediction</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Select symptoms you are experiencing from these possible matches:
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {[...new Set( // merge & remove duplicates
                          Object.values(prediction.all_predictions)
                            .flatMap((pred) => pred.top_predictions || [])
                            .slice(0, 3) // take top 3 diseases
                            .flatMap((tp) => DISEASE_SYMPTOMS[tp.disease] || [])
                        )].map((symptom) => (
                          <label
                            key={symptom}
                            className="flex items-center space-x-2 px-3 py-1 border rounded-lg text-sm cursor-pointer hover:bg-blue-50"
                          >
                            <input
                              type="checkbox"
                              checked={refineSymptoms.includes(symptom)}
                              onChange={() =>
                                setRefineSymptoms((prev) =>
                                  prev.includes(symptom)
                                    ? prev.filter((s) => s !== symptom)
                                    : [...prev, symptom]
                                )
                              }
                            />
                            <span>{symptom}</span>
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={handleRePredict}
                        disabled={refineLoading || refineSymptoms.length === 0}
                        className={`mt-4 px-4 py-2 rounded-md shadow ${
                          refineLoading || refineSymptoms.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {refineLoading ? "Re-predicting..." : "Re-Predict"}
                      </button>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-yellow-700 font-medium">Medical Disclaimer</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      This AI diagnosis is for informational purposes only and should not replace professional medical advice. 
                      Please consult with a healthcare provider for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              )}

              {!prediction && !error && !loading && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter patient information and click "Get Diagnosis" to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HealthDiagnosis;
