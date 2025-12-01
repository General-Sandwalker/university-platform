package com.university.platform.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.university.platform.ui.screens.absences.AbsencesScreen
import com.university.platform.ui.screens.home.HomeScreen
import com.university.platform.ui.screens.notifications.NotificationsScreen
import com.university.platform.ui.screens.profile.ProfileScreen
import com.university.platform.ui.screens.schedule.ScheduleScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(onLogout: () -> Unit) {
    var selectedTab by remember { mutableStateOf(0) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(getTitle(selectedTab)) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.CalendarMonth, contentDescription = "Schedule") },
                    label = { Text("Schedule") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.EventBusy, contentDescription = "Absences") },
                    label = { Text("Absences") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Notifications, contentDescription = "Notifications") },
                    label = { Text("Alerts") },
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") },
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                0 -> HomeScreen()
                1 -> ScheduleScreen()
                2 -> AbsencesScreen()
                3 -> NotificationsScreen()
                4 -> ProfileScreen(onLogout = onLogout)
            }
        }
    }
}

private fun getTitle(tab: Int): String {
    return when (tab) {
        0 -> "Home"
        1 -> "Schedule"
        2 -> "Absences"
        3 -> "Notifications"
        4 -> "Profile"
        else -> ""
    }
}
