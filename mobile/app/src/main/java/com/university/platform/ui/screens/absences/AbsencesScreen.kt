package com.university.platform.ui.screens.absences

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.university.platform.data.model.Absence

@Composable
fun AbsencesScreen(viewModel: AbsencesViewModel = viewModel()) {
    val absences by viewModel.absences.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadAbsences()
    }
    
    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(absences) { absence ->
                AbsenceCard(absence)
            }
        }
    }
}

@Composable
fun AbsenceCard(absence: Absence) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Date: ${absence.date}", style = MaterialTheme.typography.titleMedium)
            Text(text = "Status: ${absence.status}")
            if (absence.hasExcuse) {
                Text(text = "Excuse Status: ${absence.excuseStatus ?: "Pending"}")
            }
        }
    }
}
