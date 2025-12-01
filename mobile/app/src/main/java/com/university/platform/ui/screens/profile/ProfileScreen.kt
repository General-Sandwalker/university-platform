package com.university.platform.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun ProfileScreen(onLogout: () -> Unit, viewModel: ProfileViewModel = viewModel()) {
    val user by viewModel.user.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadUser()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = user?.let { "${it.firstName} ${it.lastName}" } ?: "Loading...",
                    style = MaterialTheme.typography.headlineSmall
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = "Username: ${user?.username ?: ""}")
                Text(text = "Email: ${user?.email ?: ""}")
                Text(text = "Role: ${user?.role?.name?.replace("_", " ") ?: ""}")
                user?.group?.let {
                    Text(text = "Group: ${it.code} - ${it.name}")
                }
                user?.department?.let {
                    Text(text = "Department: ${it.name}")
                }
            }
        }
        
        Spacer(modifier = Modifier.weight(1f))
        
        Button(
            onClick = {
                viewModel.logout()
                onLogout()
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error
            )
        ) {
            Text("Logout")
        }
    }
}
