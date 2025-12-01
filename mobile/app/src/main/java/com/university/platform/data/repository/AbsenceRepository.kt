package com.university.platform.data.repository

import com.university.platform.data.model.Absence
import com.university.platform.data.model.AbsenceStats
import com.university.platform.network.ApiClient
import com.university.platform.network.ApiService

class AbsenceRepository {
    private val apiService = ApiClient.createService(ApiService::class.java)
    
    suspend fun getAbsences(status: String? = null): Result<List<Absence>> {
        return try {
            val response = apiService.getAbsences(status)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch absences"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAbsenceStats(): Result<AbsenceStats> {
        return try {
            val response = apiService.getAbsenceStats()
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to fetch stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun submitExcuse(absenceId: String, reason: String): Result<Absence> {
        return try {
            val data = mapOf("reason" to reason)
            val response = apiService.submitExcuse(absenceId, data)
            if (response.success && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Failed to submit excuse"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
