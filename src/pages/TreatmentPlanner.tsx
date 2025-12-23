import { useLocation, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Activity, HeartPulse } from 'lucide-react';
import FullNavigationBar from '../components/FullNavigationBar';
import NavigationBar from '../components/NavigationBar';
import jsPDF from "jspdf";
import { DISEASE_SYMPTOMS } from "../constants/symptoms"; // Make sure this file name matches your project

const TreatmentPlanner: React.FC = () => {
  const location = useLocation();
  const state = location.state || { disease: '', age: '', symptoms: '' };

  const [formData, setFormData] = useState({
    disease: state.disease || '',
    age: state.age || '',
    duration: '',
    symptoms: state.symptoms || '',
    bloodGroup: '',
  });

  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStandardTreatment, setShowStandardTreatment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);

  // ---------------------------------------------------------
  // ✅ HYBRID VALIDATION LOGIC (Rules 1-5)
  // ---------------------------------------------------------
  
  const normalizeDisease = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ""); // removes spaces, hyphens, symbols for comparison
  };

  const isDiseaseValid = (input: string) => {
    const clean = input.trim();
    if (!clean) return false;

    const normalizedInput = normalizeDisease(clean);

    // ✅ RULE 1: Match against ALL known diseases (normalized)
    // This ensures "malaria", "MALARIA", "Malaria " all pass if they are in your list
    const knownNormalizedDiseases = Object.keys(DISEASE_SYMPTOMS).map(d =>
      normalizeDisease(d)
    );

    if (knownNormalizedDiseases.includes(normalizedInput)) {
      return true; // ✅ Known disease found
    }

    // --- If not in list, check if it's a plausible NEW disease ---

    // ❌ RULE 2: Reject very short inputs (e.g. "p", "flu", "cold" might be too generic unless in list)
    // We require at least 6 chars for unknown diseases to prevent spam
    if (clean.length < 6) return false;

    // ❌ RULE 3: Reject symbols or numbers-only junk (e.g. "12345", "!!!")
    if (!/[a-zA-Z]/.test(clean)) return false; // Must have letters
    if (!/^[a-zA-Z0-9\s'-]+$/.test(clean)) return false; // No special symbols like @#$%

    const words = clean.split(/\s+/);

    // ❌ RULE 4: Single-word unknown inputs are risky. Require at least 2 words.
    // e.g. "Viral Fever" (Valid), "Unknown" (Invalid)
    if (words.length < 2) return false;

    // ❌ RULE 5: Each word must be meaningful (at least 3 chars)
    // Prevents "A B C D"
    if (words.some(w => w.length < 3)) return false;

    return true; // ✅ New, plausible disease name
  };

  // ---------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.disease.trim()) {
      errors.disease = 'Disease field is required';
    }
    
    if (!formData.age.trim()) {
      errors.age = 'Age field is required';
    } else if (parseInt(formData.age) <= 0 || parseInt(formData.age) > 150) {
      errors.age = 'Please enter a valid age (1-150)';
    }
    
    if (!formData.duration.trim()) {
      errors.duration = 'Duration field is required';
    }
    
    if (!formData.symptoms.trim()) {
      errors.symptoms = 'Symptoms field is required';
    }
    
    if (!formData.bloodGroup) {
      errors.bloodGroup = 'Blood group is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⛔ SECURITY CHECK: Block invalid diseases BEFORE API call
    if (!isDiseaseValid(formData.disease)) {
      setValidationErrors(prev => ({
        ...prev,
        disease: "Invalid disease name. Please enter a valid medical condition (e.g. 'Viral Fever')."
      }));
      setError("Unsupported or invalid disease name.");
      return; 
    }
    
    // Validate rest of the form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setTreatmentPlan('');
    setDiagnosis('');
    setError(null);
    setValidationErrors({});
    setShowStandardTreatment(false);

    try {
      // ✅ LIVE BACKEND URL
      const response = await fetch('https://medica-backend-3-qa12.onrender.com/api/treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.treatment) {
        const t = data.treatment;

        let plan = `--------------------------------
Doctor’s Prescription
--------------------------------
Disease    : ${formData.disease}
Age        : ${formData.age}
Symptoms   : ${formData.symptoms}
Blood Group: ${formData.bloodGroup}
Duration   : ${formData.duration}\n`;

        // 💊 Medications
        plan += '\n🩺 Medications:\n';
        if (Array.isArray(t.medications) && t.medications.length > 0) {
          t.medications.forEach((m: any) => {
            plan += `  - ${m.name} (${m.intake || "1-0-1"}, ${m.timing || "after food"})\n`;
          });
        } else {
          plan += '  - No medications prescribed\n';
        }

        // 🏡 Lifestyle
        plan += '\n🏡 Lifestyle:\n';
        if (Array.isArray(t.lifestyle) && t.lifestyle.length > 0) {
          t.lifestyle.forEach((item: string) => {
            plan += `  - ${item}\n`;
          });
        } else {
          plan += '  - No lifestyle advice provided\n';
        }

        // 📅 Follow-up
        plan += `\n📅 Follow-up:\n  ${t.followup || 'Consult doctor'}\n`;

        // Footer
        plan += '--------------------------------';

        setTreatmentPlan(plan);
        const symptomsArray: string[] = [];
        if (formData.symptoms) {
          if (Array.isArray(formData.symptoms)) {
            formData.symptoms.forEach(s => {
              if (s) symptomsArray.push(s.trim());
            });
          } else if (typeof formData.symptoms === "string") {
            formData.symptoms.split(",").forEach(s => {
              if (s) symptomsArray.push(s.trim());
            });
          }
        }

        setPrescriptionData({
          disease: formData.disease,
          age: formData.age,
          symptoms: symptomsArray,
          blood_group: formData.bloodGroup,
          duration: formData.duration,
          treatment: t
        });

        if (data.id) {
          setTreatmentId(data.id);
        }

      } else {
        setError('No treatment data returned from API.');
      }

    } catch (err: any) {
      setError(err.message || '❌ Failed to generate treatment plan.');
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (treatmentPlan: any) => {
    try {
      const { disease, age, symptoms, blood_group, duration, treatment } =
        treatmentPlan;

      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Doctor’s Prescription", 105, 20, { align: "center" });
      doc.setFontSize(11);
      doc.text("--------------------------------", 105, 28, { align: "center" });

      let y = 40;
      const lineHeight = 8;

      doc.text(`Disease    : ${disease}`, 20, y); y += lineHeight;
      doc.text(`Age        : ${age}`, 20, y); y += lineHeight;
      doc.text(`Symptoms   : ${symptoms && symptoms.length > 0 ? symptoms.join(", ") : "N/A"}`, 20, y); y += lineHeight;
      doc.text(`Blood Group: ${blood_group}`, 20, y); y += lineHeight;
      doc.text(`Duration   : ${duration} days`, 20, y); y += lineHeight + 4;

      // 💊 Medications
      doc.text("Medications:\n", 20, y); y += lineHeight;
      treatment.medications.forEach((med: any) => {
        doc.text(`- ${med.name} (${med.intake}, ${med.timing})`, 30, y); 
        y += lineHeight;
      });

      // 🏡 Lifestyle
      y += 4;
      doc.text("Lifestyle:\n", 20, y); y += lineHeight;
      treatment.lifestyle.forEach((item: string) => {
        const lines = doc.splitTextToSize(`- ${item}`, 170); // wrap long text
        doc.text(lines, 30, y);
        y += lines.length * lineHeight;
      });

      // 📅 Follow-up
      y += 4;
      doc.text("Follow-up:\n", 20, y); y += lineHeight;
      const followupLines = doc.splitTextToSize(treatment.followup, 170);
      doc.text(followupLines, 30, y);
      y += followupLines.length * lineHeight;

      doc.text("--------------------------------", 105, y + 8, { align: "center" });
      doc.save(`prescription_${disease}_${Date.now()}.pdf`);

    } catch (error) {
      console.error("❌ Could not download PDF:", error);
      alert("❌ Could not download prescription. Please try again.");
    }
  };

  return (
    <>
      <FullNavigationBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">AI Treatment Planner</h2>
            <p className="text-gray-600 text-lg">Advanced API-powered treatment planning system</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Patient Information Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Patient Information</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Disease */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disease <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="disease"
                    value={formData.disease}
                    onChange={handleChange}
                    placeholder="Enter disease name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.disease ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.disease && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.disease}</p>
                  )}
                </div>

                {/* Age and Blood Group Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter age"
                      min="1"
                      max="150"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.age && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.bloodGroup ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {validationErrors.bloodGroup && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.bloodGroup}</p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 2 weeks, 1 month"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.duration && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.duration}</p>
                  )}
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="Describe symptoms (e.g., headache, fever, nausea, dizziness)"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.symptoms ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.symptoms && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.symptoms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Treatment Plan...</span>
                    </div>
                  ) : (
                    'Generate Treatment Plan'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Treatment Results */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Treatment Results
                </h3>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Processing patient information...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {treatmentPlan ? (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg
                          className="w-5 h-5 text-green-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Treatment Plan
                      </h4>

                      <div className="prose prose-sm max-w-none">
                        <pre className="hanging-indent text-gray-700 bg-white p-4 rounded border text-sm">
                          {treatmentPlan}
                        </pre>
                      </div>

                      {/* ✅ Download button */}
                      {prescriptionData && (
                        <button
                          onClick={() => handleDownloadPDF(prescriptionData)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                          Download Prescription
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm italic">
                        Enter patient information and click "Generate Treatment Plan" to see results
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TreatmentPlanner;
