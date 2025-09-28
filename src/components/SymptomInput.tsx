import React, { useState } from "react";
import { ALL_SYMPTOMS } from "../constants/symptoms";

interface SymptomInputProps {
  formData: { symptoms: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SymptomInput: React.FC<SymptomInputProps> = ({ formData, setFormData }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Get last symptom being typed (after last comma)
    const parts = value.split(",");
    const lastPart = parts[parts.length - 1].trim();

    if (lastPart.length > 0) {
      const matches = ALL_SYMPTOMS.filter((s) =>
        s.toLowerCase().includes(lastPart.toLowerCase())
      );
      setSuggestions(matches.slice(0, 8));
    } else {
      setSuggestions([]);
    }

    // Update form data
    setFormData((prev: any) => ({ ...prev, symptoms: value }));
  };

  const addSymptom = (symptom: string) => {
    let parts = query.split(",").map((s) => s.trim()).filter(Boolean);

    // Replace last unfinished part with selected symptom
    parts[parts.length - 1] = symptom;

    const updated = parts.join(", ") + ", ";
    setFormData((prev: any) => ({ ...prev, symptoms: updated }));
    setQuery(updated);
    setSuggestions([]);
  };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (suggestions.length > 0) {
      // pick first suggestion
      addSymptom(suggestions[0]);
    } else {
      // no suggestion → add whatever is typed
      const parts = query.split(",").map((s) => s.trim()).filter(Boolean);
      const lastPart = parts[parts.length - 1];

      if (lastPart) {
        addSymptom(lastPart);
      }
    }
  }
};


  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Type symptoms separated by commas..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-md shadow-md w-full max-h-40 overflow-y-auto mt-1">
          {suggestions.map((symptom) => (
            <li
              key={symptom}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => addSymptom(symptom)}
            >
              {symptom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SymptomInput;
