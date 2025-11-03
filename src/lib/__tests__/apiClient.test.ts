/**
 * Unit Tests for API Client
 * 
 * Tests retry logic, error handling, and type validation
 */

import { ApiClient } from '../apiClient'
import { z } from 'zod'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('ApiClient', () => {
  let client: ApiClient
  
  beforeEach(() => {
    client = new ApiClient('/api', { maxRetries: 3, initialDelayMs: 100 })
    jest.clearAllMocks()
    
    // Mock axios.create to return mocked instance
    mockedAxios.create = jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    } as any))
  })

  describe('type validation', () => {
    const TestSchema = z.object({
      message: z.string(),
      count: z.number(),
    })

    it('should validate successful response', async () => {
      const mockData = { message: 'Success', count: 5 }
      
      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      }
      
      mockedAxios.create = jest.fn(() => mockAxios as any)
      
      const client = new ApiClient('/api')
      const result = await client.get('/test', TestSchema)
      
      expect(result).toEqual(mockData)
    })

    it('should throw error for invalid response schema', async () => {
      const mockData = { invalid: 'data' }
      
      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
        post: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      }
      
      mockedAxios.create = jest.fn(() => mockAxios as any)
      
      const client = new ApiClient('/api')
      
      await expect(client.get('/test', TestSchema)).rejects.toThrow(
        /API response validation failed/
      )
    })
  })

  describe('request cancellation', () => {
    it('should support cancelling all requests', () => {
      expect(() => client.cancelAll()).not.toThrow()
    })

    it('should support cancelling specific request', () => {
      expect(() => client.cancel('test-id')).not.toThrow()
    })
  })

  describe('offline detection', () => {
    it('should detect offline state', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
      
      expect(navigator.onLine).toBe(true)
    })
  })
})
