/**
 * Returns the number of initial years to hide (consecutive zeros from start)
 * Supports both arrays (checks from beginning) and direct values.
 */
function shouldHideFirstYear(value) {
  // If value is an array, find how many consecutive zeros/empty from start
  if (Array.isArray(value)) {
    let hideCount = 0;
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      if (
        item === 0 ||
        item === '' ||
        item === undefined ||
        item === null ||
        (typeof item === 'string' && item.trim().toLowerCase() === 'na') ||
        (typeof item === 'string' && item.trim().toLowerCase() === 'n/a')
      ) {
        hideCount++;
      } else {
        break; // Stop at first non-zero value
      }
    }
    return hideCount; // Return number of years to hide
  }
  
  // If single value, check if it should be hidden
  if (
    value === 0 ||
    value === '' ||
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'na') ||
    (typeof value === 'string' && value.trim().toLowerCase() === 'n/a')
  ) {
    return 1; // Hide this one
  }
  return 0; // Don't hide
}

export default shouldHideFirstYear;