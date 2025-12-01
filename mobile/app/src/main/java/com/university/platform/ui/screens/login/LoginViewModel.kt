package com.university.platform.ui.screens.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.UniversityApplication
import com.university.platform.data.model.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    private val authRepository = UniversityApplication.instance.authRepository
    
    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading
            
            val result = authRepository.login(username, password)
            _uiState.value = if (result.isSuccess) {
                LoginUiState.Success(result.getOrNull()!!)
            } else {
                LoginUiState.Error(result.exceptionOrNull()?.message ?: "Login failed")
            }
        }
    }
    
    fun resetState() {
        _uiState.value = LoginUiState.Idle
    }
}

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val user: User) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}
