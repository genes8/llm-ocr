import React from 'react'
import FileUpload from './components/upload/FileUpload'
import DocumentPreview from './components/preview/DocumentPreview'
import ResultsDisplay from './components/results/ResultsDisplay'
import './App.css'

function App() {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [ocrResults, setOcrResults] = React.useState<any>(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>OCR Receipt Processor</h1>
        <p>Upload and process receipts for accounting</p>
      </header>
      
      <main className="app-main">
        <FileUpload onFileUpload={setUploadedFile} />
        
        {uploadedFile && (
          <DocumentPreview 
            file={uploadedFile} 
            onProcessComplete={setOcrResults}
          />
        )}
        
        {ocrResults && (
          <ResultsDisplay results={ocrResults} />
        )}
      </main>
    </div>
  )
}

export default App