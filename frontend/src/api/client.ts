// API client for OCR backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '60000')

export interface UploadResponse {
  file_id: string
  original_name: string
  size: number
  status: string
}

export interface ProcessRequest {
  file_id: string
  method: 'ocr' | 'llm'
  language: string
}

export interface ProcessResponse {
  status: string
  data: {
    raw_text: string
    lines: string[]
    method_used: string
    language: string
    file_id: string
  }
}

export interface Language {
  code: string
  name: string
}

class APIClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - the server took too long to respond')
        }
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/health')
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`)
    }

    return await response.json()
  }

  async processFile(request: ProcessRequest): Promise<ProcessResponse> {
    return this.request('/api/process', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getAvailableLanguages(): Promise<{ languages: Language[] }> {
    return this.request('/api/languages')
  }
}

// Export singleton instance
export const apiClient = new APIClient()

// Export individual functions for easier use
export const uploadFile = (file: File) => apiClient.uploadFile(file)
export const processFile = (request: ProcessRequest) => apiClient.processFile(request)
export const getAvailableLanguages = () => apiClient.getAvailableLanguages()
export const healthCheck = () => apiClient.healthCheck()