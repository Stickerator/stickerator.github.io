import React from 'react';

function FileInput({ onUpload }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file =>
      file.type === 'image/jpeg' || file.type === 'image/png'
    );
    onUpload(files);
  };

  return (
    <div>
      <input type="file" accept="image/jpeg, image/png" multiple onChange={handleFileChange} />
    </div>
  );
}

export default FileInput;
