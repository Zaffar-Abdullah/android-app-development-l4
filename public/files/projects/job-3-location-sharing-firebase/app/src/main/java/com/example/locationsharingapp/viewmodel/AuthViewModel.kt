package com.example.locationsharingapp.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.locationsharingapp.repository.UserRepository

class AuthViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState

    fun signUp(email: String, password: String, displayName: String, phone: String, lat: Double, lon: Double) {
        _authState.value = AuthState.Loading
        repository.signUp(email, password, displayName, phone, lat, lon) { success, error ->
            if (success) {
                _authState.value = AuthState.Success
            } else {
                _authState.value = AuthState.Error(error ?: "Unknown error")
            }
        }
    }

    fun signIn(email: String, password: String) {
        _authState.value = AuthState.Loading
        repository.signIn(email, password) { success, error ->
            if (success) {
                _authState.value = AuthState.Success
            } else {
                _authState.value = AuthState.Error(error ?: "Unknown error")
            }
        }
    }

    fun checkLoginStatus() {
        if (repository.getCurrentUserId() != null) {
            _authState.value = AuthState.Success
        }
    }

    sealed class AuthState {
        object Loading : AuthState()
        object Success : AuthState()
        data class Error(val message: String) : AuthState()
    }
}
