package com.example.locationsharingapp.ui.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.data.repository.UserRepository
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch

class ProfileViewModel(private val repository: UserRepository = UserRepository()) : ViewModel() {

    private val _userProfileState = MutableLiveData<Resource<User>>()
    val userProfileState: LiveData<Resource<User>> = _userProfileState

    private val _updateState = MutableLiveData<Resource<Boolean>>()
    val updateState: LiveData<Resource<Boolean>> = _updateState

    fun loadProfile() {
        _userProfileState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.getCurrentUser()
            _userProfileState.postValue(result)
        }
    }

    fun updateProfile(name: String) {
        if (name.isBlank()) {
            _updateState.value = Resource.Error("Name cannot be empty")
            return
        }
        _updateState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.updateUserProfile(name.trim())
            _updateState.postValue(result)
            loadProfile()
        }
    }

    fun updateLocation(latitude: Double, longitude: Double) {
        _updateState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.updateUserLocation(latitude, longitude)
            _updateState.postValue(result)
            loadProfile()
        }
    }
}
