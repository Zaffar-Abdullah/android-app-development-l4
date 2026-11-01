package com.example.locationsharingapp.ui.map

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.data.repository.UserRepository
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch

class MapViewModel(private val repository: UserRepository = UserRepository()) : ViewModel() {

    private val _mapUsersState = MutableLiveData<Resource<List<User>>>()
    val mapUsersState: LiveData<Resource<List<User>>> = _mapUsersState

    fun loadMapUsers() {
        _mapUsersState.value = Resource.Loading()
        viewModelScope.launch {
            val result = repository.getAllUsers()
            _mapUsersState.postValue(result)
        }
    }
}
