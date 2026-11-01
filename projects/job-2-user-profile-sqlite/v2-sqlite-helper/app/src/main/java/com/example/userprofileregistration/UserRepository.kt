package com.example.userprofileregistration

import android.content.Context

class UserRepository(context: Context) {
    private val dbHelper = DatabaseHelper(context)

    fun addProfile(profile: UserProfile) = dbHelper.addProfile(profile)
    fun getAllProfiles() = dbHelper.getAllProfiles()
    fun updateProfile(profile: UserProfile) = dbHelper.updateProfile(profile)
    fun deleteProfile(id: Int) = dbHelper.deleteProfile(id)
}
