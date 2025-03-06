import { useState, useEffect } from "react";

const RetrieveStoredData = () => {
  const [storedData, setStoredData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("storedData");
    if (data) {
      setStoredData(JSON.parse(data)); // Parse JSON string back to object
    }
  }, []); // Run only once on component mount

  return (
    <div>
      <h2>Retrieved Data</h2>
      {storedData ? (
        <pre>{JSON.stringify(storedData, null, 2)}</pre>
      ) : (
        <p>No data found in localStorage.</p>
      )}
    </div>
  );
};

export default RetrieveStoredData;
