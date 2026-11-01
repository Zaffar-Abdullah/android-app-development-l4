package com.example.userprofileregistration

import androidx.lifecycle.LiveData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UserProfileRepository(private val userProfileDao: UserProfileDao) {
    val allProfiles: LiveData<List<UserProfile>> = userProfileDao.getAllProfiles()

    suspend fun insert(profile: UserProfile) = withContext(Dispatchers.IO) {
        userProfileDao.insert(profile)
    }

    suspend fun update(profile: UserProfile) = withContext(Dispatchers.IO) {
        userProfileDao.update(profile)
    }

    suspend fun delete(profile: UserProfile) = withContext(Dispatchers.IO) {
        userProfileDao.delete(profile)
    }

    fun getProfileById(id: Int): LiveData<UserProfile> {
        return userProfileDao.getProfileById(id)
    }
}
