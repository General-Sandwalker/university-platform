package com.university.platform.data.repository

import com.university.platform.data.model.Notification
import com.university.platform.network.ApiClient
import com.university.platform.network.ApiService

class NotificationRepository {
    private val apiService = ApiClient.createService(ApiService::class.java)
    
    suspend fun getNotifications(): Result<List<Notification>> {
        return try {
            val response = apiService.getNotifications()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch notifications"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getUnreadCount(): Result<Int> {
        return try {
            val response = apiService.getUnreadCount()
            if (response.success && response.data != null) {
                Result.success(response.data["count"] ?: 0)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch count"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markAsRead(notificationId: String): Result<Notification> {
        return try {
            val response = apiService.markAsRead(notificationId)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to mark as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun markAllAsRead(): Result<Unit> {
        return try {
            val response = apiService.markAllAsRead()
            if (response.success) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.message ?: "Failed to mark all as read"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
