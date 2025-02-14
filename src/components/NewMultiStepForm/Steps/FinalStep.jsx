import React from "react";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import { useNavigate } from "react-router-dom";

const FinalStep = ({formData}) => {
    const navigate = useNavigate();
    const handleGeneratePDF = () => {
        // Navigate to the new page and pass form data via state
        navigate("/generated-pdf", { state: formData });
      };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add some content to the PDF
    doc.text("Final Report", 20, 30);
    doc.text("This is the content of the final report", 20, 40);
    // You can add more dynamic data to the PDF here
    
    // Save the PDF with the name 'final_report.pdf'
    doc.save("final_report.pdf");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Final Step: Generate PDF</h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to generate your final report PDF.
      </p>
      
      {/* Generate PDF Button */}
      <button 
        onClick={handleGeneratePDF}
        className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Generate PDF
      </button>
    </div>
  );
};

export default FinalStep;
