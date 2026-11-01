package com.example.userprofileregistration

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData

class ProfileViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = UserRepository(application)
    private val _profiles = MutableLiveData<List<UserProfile>>()
    val profiles: LiveData<List<UserProfile>> get() = _profiles

    fun loadProfiles() {
        _profiles.value = repository.getAllProfiles()
    }

    fun addProfile(profile: UserProfile) {
        repository.addProfile(profile)
        loadProfiles()
    }

    fun updateProfile(profile: UserProfile) {
        repository.updateProfile(profile)
        loadProfiles()
    }

    fun deleteProfile(id: Int) {
        repository.deleteProfile(id)
        loadProfiles()
    }
}
