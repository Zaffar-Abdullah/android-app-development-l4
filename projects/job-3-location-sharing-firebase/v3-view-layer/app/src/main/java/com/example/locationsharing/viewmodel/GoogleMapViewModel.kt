package com.example.locationsharing.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.locationsharing.model.AppUser
import com.example.locationsharing.repository.UserRepository

class GoogleMapViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _userList = MutableLiveData<List<AppUser>>()
    val userList: LiveData<List<AppUser>> get() = _userList

    fun fetchAllUsers() {
        repository.getAllUsers(
            onSuccess = { _userList.postValue(it) },
            onFailure = { /* Handle error */ }
        )
    }
}
