package com.university.platform.network

import com.university.platform.data.model.*
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
    
    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<User>
    
    // Timetable
    @GET("timetable/accessible-groups")
    suspend fun getAccessibleGroups(): ApiResponse<List<Group>>
    
    @GET("timetable/group/{groupId}")
    suspend fun getGroupTimetable(
        @Path("groupId") groupId: String,
        @Query("semesterId") semesterId: String? = null
    ): ApiResponse<List<TimetableEntry>>
    
    @GET("timetable/my-schedule")
    suspend fun getMyTeachingSchedule(
        @Query("semesterId") semesterId: String? = null
    ): ApiResponse<List<TimetableEntry>>
    
    // Absences
    @GET("absences")
    suspend fun getAbsences(
        @Query("status") status: String? = null
    ): ApiResponse<List<Absence>>
    
    @GET("absences/stats")
    suspend fun getAbsenceStats(): ApiResponse<AbsenceStats>
    
    @POST("absences/{id}/submit-excuse")
    suspend fun submitExcuse(
        @Path("id") absenceId: String,
        @Body data: Map<String, String>
    ): ApiResponse<Absence>
    
    // Notifications
    @GET("notifications")
    suspend fun getNotifications(): ApiResponse<List<Notification>>
    
    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): ApiResponse<Map<String, Int>>
    
    @PUT("notifications/{id}/read")
    suspend fun markAsRead(@Path("id") notificationId: String): ApiResponse<Notification>
    
    @PUT("notifications/read-all")
    suspend fun markAllAsRead(): ApiResponse<Unit>
}
