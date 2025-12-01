package com.university.platform.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun HomeScreen(viewModel: HomeViewModel = viewModel()) {
    val user by viewModel.user.collectAsState()
    val absenceStats by viewModel.absenceStats.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadData()
    }
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Welcome Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Welcome back!",
                        style = MaterialTheme.typography.titleLarge
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = user?.let { "${it.firstName} ${it.lastName}" } ?: "Loading...",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    user?.role?.let {
                        Text(
                            text = it.name.replace("_", " ").lowercase().replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
        
        // Quick Stats for Students
        if (user?.role?.name == "STUDENT" && absenceStats != null) {
            item {
                Text(
                    text = "Absence Overview",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Total",
                        value = absenceStats!!.total.toString(),
                        icon = Icons.Default.EventBusy,
                        color = MaterialTheme.colorScheme.primary
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Pending",
                        value = absenceStats!!.pending.toString(),
                        icon = Icons.Default.HourglassEmpty,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                }
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Justified",
                        value = absenceStats!!.justified.toString(),
                        icon = Icons.Default.CheckCircle,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Unjustified",
                        value = absenceStats!!.unjustified.toString(),
                        icon = Icons.Default.Cancel,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = color
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}
