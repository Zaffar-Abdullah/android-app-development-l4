package com.example.locationsharing.repository

import com.example.locationsharing.model.AppUser
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.toObject
import kotlinx.coroutines.tasks.await

class UserRepository {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("AppUsers")

    fun getCurrentUserId(): String? = auth.currentUser?.uid

    suspend fun saveUser(user: AppUser) {
        usersCollection.document(user.userId).set(user).await()
    }

    suspend fun getUser(userId: String): AppUser? {
        return usersCollection.document(userId).get().await().toObject<AppUser>()
    }

    suspend fun updateDisplayName(userId: String, name: String) {
        usersCollection.document(userId).update("displayName", name).await()
    }

    suspend fun updateLocation(userId: String, lat: Double, lng: Double) {
        usersCollection.document(userId).update(
            mapOf(
                "latitude" to lat,
                "longitude" to lng
            )
        ).await()
    }

    fun getAllUsers(onSuccess: (List<AppUser>) -> Unit, onFailure: (Exception) -> Unit) {
        usersCollection.addSnapshotListener { value, error ->
            if (error != null) {
                onFailure(error)
                return@addSnapshotListener
            }
            val userList = value?.documents?.mapNotNull { it.toObject<AppUser>() } ?: emptyList()
            onSuccess(userList)
        }
    }
}
