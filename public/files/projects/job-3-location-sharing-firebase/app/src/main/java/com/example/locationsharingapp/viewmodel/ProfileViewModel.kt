package com.example.locationsharingapp.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.locationsharingapp.model.AppUser
import com.example.locationsharingapp.repository.UserRepository

class ProfileViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _user = MutableLiveData<AppUser?>()
    val user: LiveData<AppUser?> = _user

    private val _updateStatus = MutableLiveData<Boolean>()
    val updateStatus: LiveData<Boolean> = _updateStatus

    fun fetchCurrentUser() {
        val userId = repository.getCurrentUserId() ?: return
        repository.getUserById(userId) { user ->
            _user.value = user
        }
    }

    fun updateProfile(newName: String, newPhone: String) {
        val userId = repository.getCurrentUserId() ?: return
        repository.updateDisplayName(userId, newName) { success, _ ->
            if (success) {
                repository.updatePhoneNumber(userId, newPhone) { phoneSuccess, _ ->
                    _updateStatus.value = phoneSuccess
                    if (phoneSuccess) fetchCurrentUser()
                }
            } else {
                _updateStatus.value = false
            }
        }
    }
}
