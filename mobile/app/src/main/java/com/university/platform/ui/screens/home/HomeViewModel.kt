package com.university.platform.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.UniversityApplication
import com.university.platform.data.model.AbsenceStats
import com.university.platform.data.model.User
import com.university.platform.data.repository.AbsenceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {
    private val authRepository = UniversityApplication.instance.authRepository
    private val absenceRepository = AbsenceRepository()
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    private val _absenceStats = MutableStateFlow<AbsenceStats?>(null)
    val absenceStats: StateFlow<AbsenceStats?> = _absenceStats.asStateFlow()
    
    fun loadData() {
        viewModelScope.launch {
            // Load user
            authRepository.getCurrentUser().onSuccess {
                _user.value = it
                
                // Load absence stats if student
                if (it.role.name == "STUDENT") {
                    absenceRepository.getAbsenceStats().onSuccess { stats ->
                        _absenceStats.value = stats
                    }
                }
            }
        }
    }
}
