import React from 'react'
import { useDropzone } from 'react-dropzone'
import './FileUpload.css'

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  return (
    <div className="file-upload">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <>
              <p>Drag & drop a receipt or click to select</p>
              <p className="supported-formats">
                Supports: JPG, PNG, PDF
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileUpload