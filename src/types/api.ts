/**
 * API request/response type definitions.
 * @module types/api
 */

import type { RiskReport, URLCheckResult, PhoneCheckResult } from './analysis'

export interface AnalyzeRequest {
  image?: string
  text?: string
  phoneNumber?: string
  language: 'BM' | 'EN'
}

export interface AnalyzeResponse {
  success: boolean
  data?: RiskReport
  error?: ApiError
}

export interface CheckUrlResponse {
  success: boolean
  data?: URLCheckResult
  error?: ApiError
}

export interface CheckPhoneResponse {
  success: boolean
  data?: PhoneCheckResult
  error?: ApiError
}

export interface ReportPhoneRequest {
  phoneNumber: string
  scamType: string
  description?: string
}

export interface ReportPhoneResponse {
  success: boolean
  data?: { id: string; totalReports: number }
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}
