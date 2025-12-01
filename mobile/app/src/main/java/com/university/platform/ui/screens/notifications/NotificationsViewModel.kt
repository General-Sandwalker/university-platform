package com.university.platform.ui.screens.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.data.model.Notification
import com.university.platform.data.repository.NotificationRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotificationsViewModel : ViewModel() {
    private val notificationRepository = NotificationRepository()
    
    private val _notifications = MutableStateFlow<List<Notification>>(emptyList())
    val notifications: StateFlow<List<Notification>> = _notifications.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadNotifications() {
        viewModelScope.launch {
            _isLoading.value = true
            notificationRepository.getNotifications().onSuccess {
                _notifications.value = it
            }
            _isLoading.value = false
        }
    }
}
