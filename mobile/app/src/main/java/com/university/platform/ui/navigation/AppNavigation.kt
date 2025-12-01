package com.university.platform.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.university.platform.UniversityApplication
import com.university.platform.ui.screens.login.LoginScreen
import com.university.platform.ui.screens.main.MainScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val authRepository = UniversityApplication.instance.authRepository
    val token by authRepository.getToken().collectAsState(initial = null)
    
    val startDestination = if (token != null) Screen.Main.route else Screen.Login.route
    
    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Main.route) {
            MainScreen(
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Main.route) { inclusive = true }
                    }
                }
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Main : Screen("main")
}
