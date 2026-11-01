package com.example.userprofileregistration

import androidx.lifecycle.LiveData
import androidx.room.*

@Dao
interface UserProfileDao {
    @Insert
    fun insert(profile: UserProfile)

    @Update
    fun update(profile: UserProfile)

    @Delete
    fun delete(profile: UserProfile)

    @Query("SELECT * FROM user_profiles")
    fun getAllProfiles(): LiveData<List<UserProfile>>

    @Query("SELECT * FROM user_profiles WHERE id = :id")
    fun getProfileById(id: Int): LiveData<UserProfile>
}
