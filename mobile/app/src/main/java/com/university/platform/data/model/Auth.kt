package com.university.platform.data.model

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val data: LoginData
)

data class LoginData(
    val token: String,
    val user: User
)

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?
)
