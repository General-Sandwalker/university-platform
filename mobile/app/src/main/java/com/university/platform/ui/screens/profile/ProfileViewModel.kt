package com.university.platform.ui.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.UniversityApplication
import com.university.platform.data.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    private val authRepository = UniversityApplication.instance.authRepository
    
    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()
    
    fun loadUser() {
        viewModelScope.launch {
            authRepository.getCurrentUser().onSuccess {
                _user.value = it
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}
