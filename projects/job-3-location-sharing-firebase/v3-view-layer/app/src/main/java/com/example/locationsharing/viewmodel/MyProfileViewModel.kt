package com.example.locationsharing.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locationsharing.model.AppUser
import com.example.locationsharing.repository.UserRepository
import kotlinx.coroutines.launch

class MyProfileViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _currentUser = MutableLiveData<AppUser?>()
    val currentUser: LiveData<AppUser?> get() = _currentUser

    private val _updateStatus = MutableLiveData<Boolean>()
    val updateStatus: LiveData<Boolean> get() = _updateStatus

    fun fetchCurrentUser() {
        val uid = repository.getCurrentUserId()
        if (uid != null) {
            viewModelScope.launch {
                _currentUser.value = repository.getUser(uid)
            }
        }
    }

    fun saveUser(user: AppUser) {
        viewModelScope.launch {
            repository.saveUser(user)
        }
    }

    fun updateDisplayName(name: String) {
        val uid = repository.getCurrentUserId()
        if (uid != null) {
            viewModelScope.launch {
                repository.updateDisplayName(uid, name)
                _updateStatus.value = true
                fetchCurrentUser()
            }
        }
    }

    fun updateLocation(lat: Double, lng: Double) {
        val uid = repository.getCurrentUserId()
        if (uid != null) {
            viewModelScope.launch {
                repository.updateLocation(uid, lat, lng)
            }
        }
    }
}
