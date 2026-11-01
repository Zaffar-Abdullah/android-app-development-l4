package com.example.locationsharingapp.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.locationsharingapp.model.AppUser
import com.example.locationsharingapp.repository.UserRepository

class FriendListViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _users = MutableLiveData<List<AppUser>>()
    val users: LiveData<List<AppUser>> = _users

    fun fetchUsers() {
        repository.getAllUsers { userList ->
            _users.value = userList
        }
    }

    fun signOut() {
        repository.signOut()
    }
}
