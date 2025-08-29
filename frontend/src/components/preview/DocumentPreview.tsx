import React from 'react'
import { uploadFile, processFile, getAvailableLanguages, Language } from '../../api/client'
import './DocumentPreview.css'

interface DocumentPreviewProps {
  file: File
  onProcessComplete: (results: any) => void
}

interface ProcessingState {
  uploading: boolean
  processing: boolean
  error: string | null
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, onProcessComplete }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string>('')
  const [state, setState] = React.useState<ProcessingState>({
    uploading: false,
    processing: false,
    error: null
  })
  const [selectedMethod, setSelectedMethod] = React.useState<'ocr' | 'llm'>('ocr')
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>('eng')
  const [availableLanguages, setAvailableLanguages] = React.useState<Language[]>([])
  const [fileId, setFileId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Load available languages
    getAvailableLanguages().then(response => {
      setAvailableLanguages(response.languages)
    }).catch(error => {
      console.error('Failed to load languages:', error)
    })

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleProcess = async () => {
    try {
      setState(prev => ({ ...prev, uploading: true, error: null }))
      
      // Step 1: Upload file
      const uploadResponse = await uploadFile(file)
      setFileId(uploadResponse.file_id)
      
      setState(prev => ({ ...prev, uploading: false, processing: true }))
      
      // Step 2: Process file
      const processResponse = await processFile({
        file_id: uploadResponse.file_id,
        method: selectedMethod,
        language: selectedLanguage
      })
      
      // Transform API response to match expected format
      const results = {
        id: uploadResponse.file_id,
        fileName: file.name,
        method: processResponse.data.method_used,
        language: processResponse.data.language,
        rawText: processResponse.data.raw_text,
        lines: processResponse.data.lines,
        extractedData: parseExtractedText(processResponse.data.raw_text)
      }
      
      onProcessComplete(results)
      setState(prev => ({ ...prev, processing: false }))
      
    } catch (error) {
      console.error('Processing failed:', error)
      setState(prev => ({
        ...prev,
        uploading: false,
        processing: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
    }
  }
  
  // Simple text parsing to extract potential expense items
  const parseExtractedText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const items: any[] = []
    let total = 0
    
    // This is a basic parser - can be enhanced based on actual OCR output
    lines.forEach(line => {
      const amountMatch = line.match(/([0-9]+[.,][0-9]{2})/)
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1].replace(',', '.'))
        items.push({
          description: line.replace(amountMatch[0], '').trim() || 'Item',
          amount: amount,
          category: 'Other'
        })
        total += amount
      }
    })
    
    return {
      items: items.length > 0 ? items : [{
        description: 'Extracted content (no structured data found)',
        amount: 0,
        category: 'Other'
      }],
      total,
      date: new Date().toISOString().split('T')[0],
      merchant: 'Unknown'
    }
  }

  return (
    <div className="document-preview">
      <h2>Document Preview</h2>
      
      <div className="preview-content">
        <div className="preview-image">
          {file.type.startsWith('image/') ? (
            <img src={previewUrl} alt="Document preview" />
          ) : (
            <div className="pdf-preview">
              <div className="pdf-icon">📄</div>
              <p>{file.name}</p>
            </div>
          )}
        </div>
        
        <div className="preview-actions">
          <div className="processing-options">
            <div className="option-group">
              <label>Method:</label>
              <select 
                value={selectedMethod} 
                onChange={(e) => setSelectedMethod(e.target.value as 'ocr' | 'llm')}
                disabled={state.uploading || state.processing}
              >
                <option value="ocr">OCR (Tesseract)</option>
                <option value="llm">LLM (Vision Model)</option>
              </select>
            </div>
            
            <div className="option-group">
              <label>Language:</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={state.uploading || state.processing}
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {state.error && (
            <div className="error-message">
              Error: {state.error}
            </div>
          )}
          
          <button 
            onClick={handleProcess}
            disabled={state.uploading || state.processing}
            className="process-button"
          >
            {state.uploading ? 'Uploading...' : 
             state.processing ? 'Processing...' : 
             'Process Document'}
          </button>
          
          <div className="file-info">
            <p><strong>File name:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {file.type}</p>
            {fileId && <p><strong>File ID:</strong> {fileId}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentPreview