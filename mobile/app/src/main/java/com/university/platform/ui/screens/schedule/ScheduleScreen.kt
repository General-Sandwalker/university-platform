package com.university.platform.ui.screens.schedule

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.university.platform.data.model.TimetableEntry

@Composable
fun ScheduleScreen(viewModel: ScheduleViewModel = viewModel()) {
    val entries by viewModel.entries.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadSchedule()
    }
    
    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(entries) { entry ->
                TimetableCard(entry)
            }
        }
    }
}

@Composable
fun TimetableCard(entry: TimetableEntry) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = entry.subject.name, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "${entry.dayOfWeek.replaceFirstChar { it.uppercase() }} • ${entry.startTime} - ${entry.endTime}")
            Text(text = "Room: ${entry.room.name}")
            Text(text = "Teacher: ${entry.teacher.firstName} ${entry.teacher.lastName}")
            Text(text = "Group: ${entry.group.code}")
        }
    }
}
