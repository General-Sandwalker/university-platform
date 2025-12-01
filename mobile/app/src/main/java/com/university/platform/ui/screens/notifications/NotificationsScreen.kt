package com.university.platform.ui.screens.notifications

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.university.platform.data.model.Notification

@Composable
fun NotificationsScreen(viewModel: NotificationsViewModel = viewModel()) {
    val notifications by viewModel.notifications.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadNotifications()
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
            items(notifications) { notification ->
                NotificationCard(notification)
            }
        }
    }
}

@Composable
fun NotificationCard(notification: Notification) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = notification.title, style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = notification.message)
            Text(text = notification.createdAt, style = MaterialTheme.typography.bodySmall)
        }
    }
}
