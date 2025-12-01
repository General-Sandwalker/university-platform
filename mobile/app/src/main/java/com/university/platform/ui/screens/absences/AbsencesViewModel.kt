package com.university.platform.ui.screens.absences

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.university.platform.data.model.Absence
import com.university.platform.data.repository.AbsenceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AbsencesViewModel : ViewModel() {
    private val absenceRepository = AbsenceRepository()
    
    private val _absences = MutableStateFlow<List<Absence>>(emptyList())
    val absences: StateFlow<List<Absence>> = _absences.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadAbsences() {
        viewModelScope.launch {
            _isLoading.value = true
            absenceRepository.getAbsences().onSuccess {
                _absences.value = it
            }
            _isLoading.value = false
        }
    }
}
