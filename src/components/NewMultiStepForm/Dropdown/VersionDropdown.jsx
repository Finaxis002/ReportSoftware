// import React, { useState, useEffect } from "react";
// import Select from "react-select";

// const VersionDropdown = ({ selectedVersion, onVersionChange, onUpdateClick }) => {
//   const [isDarkMode, setIsDarkMode] = useState(
//     document.documentElement.classList.contains("dark")
//   );
  
//   const [localSelectedVersion, setLocalSelectedVersion] = useState(selectedVersion);
//   const [showUpdateButton, setShowUpdateButton] = useState(false);

//   useEffect(() => {
//     setLocalSelectedVersion(selectedVersion);
//   }, [selectedVersion]);

//   useEffect(() => {
//     const observer = new MutationObserver(() => {
//       setIsDarkMode(document.documentElement.classList.contains("dark"));
//     });

//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ["class"],
//     });

//     return () => observer.disconnect();
//   }, []);

//   const versionOptions = [
//     { value: "Version 1", label: "Version 1" },
//     { value: "Version 2", label: "Version 2" },
//     { value: "Version 3", label: "Version 3" },
//     { value: "Version 4", label: "Version 4" },
//     { value: "Version 5", label: "Version 5" },
//   ];

//   const selectedOption = versionOptions.find(option => option.value === localSelectedVersion);

//   const handleSelect = (selectedOption) => {
//     const version = selectedOption ? selectedOption.value : "Version 1";
//     setLocalSelectedVersion(version);
//     setShowUpdateButton(true);
//     // Only update local state, NOT the database
//     localStorage.setItem("selectedConsultantReportVersion", version);
//   };

//   const handleUpdateClick = () => {
//     // Call parent function to save to database
//     if (onUpdateClick) {
//       onUpdateClick(localSelectedVersion);
//     }
//     // Update the main selected version
//     onVersionChange(localSelectedVersion);
//     setShowUpdateButton(false);
//   };

//   const handleCancel = () => {
//     // Revert to original version
//     setLocalSelectedVersion(selectedVersion);
//     setShowUpdateButton(false);
//   };

//   return (
//     <div className="m-1 flex items-center justify-center gap-4 dark">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
//         <div className="flex gap-4 align-start justify-center text-start">
//           <div className="flex gap-2">
//             <Select
//               className="w-full sm:w-[15rem]"
//               options={versionOptions}
//               value={selectedOption}
//               onChange={handleSelect}
//               placeholder={
//                 <span className="text-gray-400 dark:text-gray-400">
//                   Select version...
//                 </span>
//               }
//               styles={{
//                 control: (base) => ({
//                   ...base,
//                   backgroundColor: 'transparent',
//                   borderColor: '#e2e8f0',
//                   '&:hover': {
//                     borderColor: '#cbd5e1'
//                   },
//                   minHeight: '40px',
//                   boxShadow: 'none',
//                   borderRadius: '8px',
//                 }),
//                 menu: (base) => ({
//                   ...base,
//                   backgroundColor: '#ffffff',
//                   borderColor: '#e2e8f0',
//                   borderRadius: '8px',
//                   boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
//                   zIndex: 9999,
//                 }),
//                 option: (base, { isFocused, isSelected }) => ({
//                   ...base,
//                   backgroundColor: isSelected
//                     ? '#3b82f6'
//                     : isFocused
//                     ? '#f1f5f9'
//                     : undefined,
//                   color: isSelected ? 'white' : '#1e293b',
//                   '&:active': {
//                     backgroundColor: '#3b82f6',
//                     color: 'white'
//                   }
//                 }),
//               }}
//             />
            
//             <div className="flex gap-2 items-center justify-center">
//               <p className="text-sm text-gray-500 mt-1">
//                 Current: {selectedVersion} {showUpdateButton && `→ ${localSelectedVersion}`}
//               </p>
              
//               {showUpdateButton && (
//                 <div className="flex gap-2 mt-2">
//                   <button
//                     onClick={handleUpdateClick}
//                     className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
//                   >
//                     Update Version
//                   </button>
//                   <button
//                     onClick={handleCancel}
//                     className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VersionDropdown;




import React, { useState, useEffect } from "react";
import Select from "react-select";

const VersionDropdown = ({ selectedVersion, onVersionChange, onUpdateClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  
  const [localSelectedVersion, setLocalSelectedVersion] = useState(selectedVersion);
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  useEffect(() => {
    setLocalSelectedVersion(selectedVersion);
  }, [selectedVersion]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const versionOptions = [
    { value: "Version 1", label: "Version 1" },
    { value: "Version 2", label: "Version 2" },
    { value: "Version 3", label: "Version 3" },
    { value: "Version 4", label: "Version 4" },
    { value: "Version 5", label: "Version 5" },
  ];

  const selectedOption = versionOptions.find(option => option.value === localSelectedVersion);

  const handleSelect = (selectedOption) => {
    const version = selectedOption ? selectedOption.value : "Version 1";
    setLocalSelectedVersion(version);
    setShowUpdateButton(true);
    
    // Update both localStorage entries
    localStorage.setItem("selectedConsultantReportVersion", version);
    
    // ALSO update formData in localStorage (just like FirstStepBasicDetails does)
    const formDataFromStorage = JSON.parse(localStorage.getItem("formData") || "{}");
    const updatedFormData = {
      ...formDataFromStorage,
      version: version
    };
    localStorage.setItem("formData", JSON.stringify(updatedFormData));
    
    console.log("✅ Updated localStorage formData version to:", version);
  };

  const handleUpdateClick = () => {
    // Call parent function to save to database
    if (onUpdateClick) {
      onUpdateClick(localSelectedVersion);
    }
    // Update the main selected version
    onVersionChange(localSelectedVersion);
    setShowUpdateButton(false);
  };

  const handleCancel = () => {
    // Revert to original version
    setLocalSelectedVersion(selectedVersion);
    setShowUpdateButton(false);
  };

  return (
    <div className="m-1 flex items-center justify-center gap-4 dark">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <div className="flex gap-4 align-start justify-center text-start">
          <div className="flex gap-2">
            <Select
              className="w-full sm:w-[15rem]"
              options={versionOptions}
              value={selectedOption}
              onChange={handleSelect}
              placeholder={
                <span className="text-gray-400 dark:text-gray-400">
                  Select version...
                </span>
              }
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'transparent',
                  borderColor: '#e2e8f0',
                  '&:hover': {
                    borderColor: '#cbd5e1'
                  },
                  minHeight: '40px',
                  boxShadow: 'none',
                  borderRadius: '8px',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  zIndex: 9999,
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? '#3b82f6'
                    : isFocused
                    ? '#f1f5f9'
                    : undefined,
                  color: isSelected ? 'white' : '#1e293b',
                  '&:active': {
                    backgroundColor: '#3b82f6',
                    color: 'white'
                  }
                }),
              }}
            />
            
            <div className="flex gap-2 items-center justify-center">
              <p className="text-sm text-gray-500 mt-1">
                Current: {selectedVersion} {showUpdateButton && `→ ${localSelectedVersion}`}
              </p>
              
              {showUpdateButton && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleUpdateClick}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Update Version
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionDropdown;