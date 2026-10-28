package com.example.userprofileregistration

import android.app.Application
import androidx.lifecycle.*
import kotlinx.coroutines.launch

class UserProfileViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: UserProfileRepository
    val allProfiles: LiveData<List<UserProfile>>

    init {
        val dao = UserDatabase.getDatabase(application).userProfileDao()
        repository = UserProfileRepository(dao)
        allProfiles = repository.allProfiles
    }

    fun insert(profile: UserProfile) = viewModelScope.launch {
        repository.insert(profile)
    }

    fun update(profile: UserProfile) = viewModelScope.launch {
        repository.update(profile)
    }

    fun delete(profile: UserProfile) = viewModelScope.launch {
        repository.delete(profile)
    }

    fun getProfileById(id: Int): LiveData<UserProfile> {
        return repository.getProfileById(id)
    }
}
