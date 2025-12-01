package com.university.platform.ui.screens.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.UniversityApplication
import com.university.platform.data.model.TimetableEntry
import com.university.platform.data.model.UserRole
import com.university.platform.data.repository.TimetableRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ScheduleViewModel : ViewModel() {
    private val authRepository = UniversityApplication.instance.authRepository
    private val timetableRepository = TimetableRepository()
    
    private val _entries = MutableStateFlow<List<TimetableEntry>>(emptyList())
    val entries: StateFlow<List<TimetableEntry>> = _entries.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadSchedule() {
        viewModelScope.launch {
            _isLoading.value = true
            authRepository.getCurrentUser().onSuccess { user ->
                when (user.role) {
                    UserRole.TEACHER -> {
                        timetableRepository.getMyTeachingSchedule().onSuccess {
                            _entries.value = it
                        }
                    }
                    UserRole.STUDENT -> {
                        user.group?.let { group ->
                            timetableRepository.getGroupTimetable(group.id).onSuccess {
                                _entries.value = it
                            }
                        }
                    }
                    else -> {
                        timetableRepository.getAccessibleGroups().onSuccess { groups ->
                            if (groups.isNotEmpty()) {
                                timetableRepository.getGroupTimetable(groups[0].id).onSuccess {
                                    _entries.value = it
                                }
                            }
                        }
                    }
                }
            }
            _isLoading.value = false
        }
    }
}
