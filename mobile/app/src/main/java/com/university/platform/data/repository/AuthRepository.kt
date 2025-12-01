package com.university.platform.data.repository

import android.content.Context
import com.university.platform.data.model.LoginRequest
import com.university.platform.data.model.User
import com.university.platform.network.ApiClient
import com.university.platform.network.ApiService
import com.university.platform.network.TokenManager
import kotlinx.coroutines.flow.Flow

class AuthRepository(private val context: Context) {
    private val apiService = ApiClient.createService(ApiService::class.java)
    
    suspend fun login(username: String, password: String): Result<User> {
        return try {
            val response = apiService.login(LoginRequest(username, password))
            if (response.success) {
                TokenManager.saveToken(context, response.data.token)
                Result.success(response.data.user)
            } else {
                Result.failure(Exception("Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getCurrentUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getToken(): Flow<String?> {
        return TokenManager.getToken(context)
    }
    
    suspend fun logout() {
        TokenManager.clearToken(context)
    }
}
