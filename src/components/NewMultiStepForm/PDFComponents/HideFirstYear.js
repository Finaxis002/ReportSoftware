// HideFirstYear.js

/**
 * Checks if the received value should trigger "hide".
 * Supports both arrays (checks first element) and direct values.
 */
function shouldHideFirstYear(value) {
  // If value is an array, use its first element
  if (Array.isArray(value)) value = value[0];

  // Now 'value' is a single item, check the hide conditions
  if (
    value === 0 ||
    value === '' ||
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'na') ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'n/a')
  ) {
    return true; // Should hide
  }
  return false; // Should show
}

export default shouldHideFirstYear;
