package com.example.locationsharingapp.ui.friends

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.data.repository.UserRepository
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch

class FriendListViewModel(private val repository: UserRepository = UserRepository()) : ViewModel() {

    private val _usersState = MutableLiveData<Resource<List<User>>>()
    val usersState: LiveData<Resource<List<User>>> = _usersState

    fun loadUsers() {
        _usersState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.getAllUsers()
            _usersState.postValue(result)
        }
    }

    fun logout() {
        repository.logout()
    }
}
