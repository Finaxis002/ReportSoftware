

export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
    };

   // Regex for email validation
export  const validateEmail = (email = "") => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
  };


export const validateAadhaarNumber = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/; // Matches exactly 12 digits
    return aadhaarRegex.test(aadhaar.trim());
};

//pan validation
export const validatePANNumber = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/; // PAN validation regex
    return panRegex.test(pan.trim());
};

//GSTIN Validation
export const validateGSTIN = (gstin) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[0-9A-Z]{1}$/; // GSTIN validation regex
    return gstinRegex.test(gstin.trim());
};

// Validate TAN Number
export const validateTANNumber = (tan) => {
    console.log("Validate tan number")
    const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/; // TAN validation regex
    return tanRegex.test(tan.trim());
};

export const validateUDYAMNumber = (udyam) => {
    const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/; // UDYAM validation regex
    return udyamRegex.test(udyam.trim());
  };