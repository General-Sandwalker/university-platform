package com.university.platform.data.repository

import com.university.platform.data.model.Group
import com.university.platform.data.model.TimetableEntry
import com.university.platform.network.ApiClient
import com.university.platform.network.ApiService

class TimetableRepository {
    private val apiService = ApiClient.createService(ApiService::class.java)
    
    suspend fun getAccessibleGroups(): Result<List<Group>> {
        return try {
            val response = apiService.getAccessibleGroups()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch groups"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getGroupTimetable(groupId: String, semesterId: String? = null): Result<List<TimetableEntry>> {
        return try {
            val response = apiService.getGroupTimetable(groupId, semesterId)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch timetable"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getMyTeachingSchedule(semesterId: String? = null): Result<List<TimetableEntry>> {
        return try {
            val response = apiService.getMyTeachingSchedule(semesterId)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch schedule"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
