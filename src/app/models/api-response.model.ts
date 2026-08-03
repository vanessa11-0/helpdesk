export interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
}

export interface ApiErrorResponse {
    statusCode: number
    code: string 
    message: string | string[]
    timestamp?: string
}
