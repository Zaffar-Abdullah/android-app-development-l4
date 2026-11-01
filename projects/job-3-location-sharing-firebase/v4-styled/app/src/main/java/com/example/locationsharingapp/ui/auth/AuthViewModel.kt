package com.example.locationsharingapp.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.data.repository.UserRepository
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: UserRepository = UserRepository()) : ViewModel() {

    private val _authState = MutableLiveData<Resource<User>>()
    val authState: LiveData<Resource<User>> = _authState

    private val _locationUpdateState = MutableLiveData<Resource<Boolean>>()
    val locationUpdateState: LiveData<Resource<Boolean>> = _locationUpdateState

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _authState.value = Resource.Error("Email and Password cannot be empty")
            return
        }

        _authState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.loginUser(email.trim(), password.trim())
            _authState.postValue(result)
        }
    }

    fun register(name: String, email: String, password: String) {
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            _authState.value = Resource.Error("All fields are required for registration")
            return
        }
        if (password.length < 6) {
            _authState.value = Resource.Error("Password must be at least 6 characters long")
            return
        }

        _authState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.registerUser(name.trim(), email.trim(), password.trim())
            _authState.postValue(result)
        }
    }

    fun updateLocation(latitude: Double, longitude: Double) {
        viewModelScope.launch {
            val res = repository.updateUserLocation(latitude, longitude)
            _locationUpdateState.postValue(res)
        }
    }

    fun checkUserLoggedIn(): Boolean = repository.isUserLoggedIn
}
