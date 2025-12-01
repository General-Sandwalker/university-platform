package com.university.platform

import android.app.Application
import com.university.platform.data.repository.AuthRepository
import com.university.platform.network.ApiClient

class UniversityApplication : Application() {
    lateinit var authRepository: AuthRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        
        // Initialize API client
        ApiClient.initialize(this)
        
        // Initialize repositories
        authRepository = AuthRepository(this)
    }

    companion object {
        lateinit var instance: UniversityApplication
            private set
    }
}
