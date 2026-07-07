import { NextResponse } from 'next/server'

export type ApiErrorCode = Uppercase<string>

export type ApiErrorBody = {
  code: ApiErrorCode
  message: string
}

export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  error: null
}

export type ApiErrorEnvelope = {
  success: false
  data: null
  error: ApiErrorBody
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessEnvelope<T>>(
    {
      success: true,
      data,
      error: null,
    },
    { status },
  )
}

export function apiError(code: ApiErrorCode, message: string, status = 400) {
  return NextResponse.json<ApiErrorEnvelope>(
    {
      success: false,
      data: null,
      error: { code, message },
    },
    { status },
  )
}

export const unauthorizedResponse = () => apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu.', 401)

export const adminOnlyResponse = () => apiError('ADMIN_ONLY', 'Akses hanya tersedia untuk admin.', 403)
