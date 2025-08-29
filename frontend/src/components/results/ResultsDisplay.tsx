import React from 'react'
import './ResultsDisplay.css'

interface ExpenseItem {
  description: string
  amount: number
  category: string
}

interface OCRResults {
  id: string
  fileName: string
  method?: string
  language?: string
  rawText?: string
  lines?: string[]
  extractedData?: {
    items: ExpenseItem[]
    total: number
    date: string
    merchant: string
  }
  // Legacy format support
  items?: ExpenseItem[]
  total?: number
  date?: string
  merchant?: string
}

interface ResultsDisplayProps {
  results: OCRResults
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  // Support both new and legacy formats
  const items = results.extractedData?.items || results.items || []
  const initialTotal = results.extractedData?.total || results.total || 0
  const date = results.extractedData?.date || results.date || new Date().toISOString().split('T')[0]
  const merchant = results.extractedData?.merchant || results.merchant || 'Unknown'
  
  const [editedItems, setEditedItems] = React.useState<ExpenseItem[]>(items)
  const [showRawText, setShowRawText] = React.useState(false)

  const handleItemChange = (index: number, field: keyof ExpenseItem, value: string) => {
    const newItems = [...editedItems]
    if (field === 'amount') {
      newItems[index][field] = parseFloat(value) || 0
    } else {
      newItems[index][field] = value
    }
    setEditedItems(newItems)
  }

  const totalAmount = editedItems.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="results-display">
      <h2>OCR Results</h2>
      
      <div className="results-header">
        <div className="result-meta">
          <p><strong>File:</strong> {results.fileName}</p>
          <p><strong>Merchant:</strong> {merchant}</p>
          <p><strong>Date:</strong> {date}</p>
          {results.method && <p><strong>Method:</strong> {results.method}</p>}
          {results.language && <p><strong>Language:</strong> {results.language}</p>}
        </div>
        
        <div className="total-amount">
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
        </div>
      </div>

      {results.rawText && (
        <div className="raw-text-section">
          <div className="section-header">
            <h3>Raw Extracted Text</h3>
            <button 
              className="toggle-button"
              onClick={() => setShowRawText(!showRawText)}
            >
              {showRawText ? 'Hide' : 'Show'} Raw Text
            </button>
          </div>
          
          {showRawText && (
            <div className="raw-text-content">
              <pre>{results.rawText}</pre>
            </div>
          )}
        </div>
      )}

      <div className="expense-items">
        <h3>Expense Items</h3>
        
        <div className="items-table">
          <div className="table-header">
            <span>Description</span>
            <span>Amount</span>
            <span>Category</span>
          </div>
          
          {editedItems.map((item, index) => (
            <div key={index} className="table-row">
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="item-input"
              />
              <input
                type="number"
                step="0.01"
                value={item.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                className="item-input amount"
              />
              <select
                value={item.category}
                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                className="item-input"
              >
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Transportation">Transportation</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="results-actions">
        <button className="export-button">
          Export to Database
        </button>
        <button className="download-button">
          Download CSV
        </button>
        {results.rawText && (
          <button 
            className="download-button"
            onClick={() => {
              const blob = new Blob([results.rawText!], { type: 'text/markdown' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${results.fileName}-extracted.md`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Download Markdown
          </button>
        )}
      </div>
    </div>
  )
}

export default ResultsDisplay