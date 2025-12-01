package com.university.platform.network

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

object TokenManager {
    private val TOKEN_KEY = stringPreferencesKey("auth_token")
    
    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }
    
    fun getToken(context: Context): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[TOKEN_KEY]
        }
    }
    
    suspend fun clearToken(context: Context) {
        context.dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
        }
    }
}
