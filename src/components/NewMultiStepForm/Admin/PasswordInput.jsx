import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter password"
        style={{
          width: '100%',
          padding: '10px',
          paddingRight: '40px', // Add space for icon
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '16px',
        }}
      />
      <FontAwesomeIcon
        icon={showPassword ? faEyeSlash : faEye}
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          color: '#666',
          fontSize: '20px',
        }}
      />
    </div>
  );
};

export default PasswordInput;
