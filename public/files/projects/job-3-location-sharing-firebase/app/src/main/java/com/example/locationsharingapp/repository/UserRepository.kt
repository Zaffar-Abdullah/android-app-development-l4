package com.example.locationsharingapp.repository

import com.example.locationsharingapp.model.AppUser
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.toObject

class UserRepository {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val usersCollection = db.collection("AppUsers")

    fun signUp(email: String, password: String, displayName: String, phoneNumber: String, latitude: Double, longitude: Double, onResult: (Boolean, String?) -> Unit) {
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val userId = auth.currentUser?.uid ?: ""
                    val user = AppUser(userId, email, displayName, phoneNumber, latitude, longitude)
                    saveUserToFirestore(user, onResult)
                } else {
                    onResult(false, task.exception?.message)
                }
            }
    }

    fun signIn(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    onResult(true, null)
                } else {
                    onResult(false, task.exception?.message)
                }
            }
    }

    fun signOut() {
        auth.signOut()
    }

    fun getCurrentUserId(): String? = auth.currentUser?.uid

    private fun saveUserToFirestore(user: AppUser, onResult: (Boolean, String?) -> Unit) {
        usersCollection.document(user.userId).set(user)
            .addOnSuccessListener { onResult(true, null) }
            .addOnFailureListener { onResult(false, it.message) }
    }

    fun updateDisplayName(userId: String, name: String, onResult: (Boolean, String?) -> Unit) {
        usersCollection.document(userId).update("displayName", name)
            .addOnSuccessListener { onResult(true, null) }
            .addOnFailureListener { onResult(false, it.message) }
    }

    fun updatePhoneNumber(userId: String, phone: String, onResult: (Boolean, String?) -> Unit) {
        usersCollection.document(userId).update("phoneNumber", phone)
            .addOnSuccessListener { onResult(true, null) }
            .addOnFailureListener { onResult(false, it.message) }
    }

    fun updateLocation(userId: String, latitude: Double, longitude: Double) {
        usersCollection.document(userId).update(
            "latitude", latitude,
            "longitude", longitude
        )
    }

    fun getAllUsers(onResult: (List<AppUser>) -> Unit) {
        usersCollection.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            val users = snapshot?.documents?.mapNotNull { it.toObject<AppUser>() } ?: emptyList()
            onResult(users)
        }
    }

    fun getUserById(userId: String, onResult: (AppUser?) -> Unit) {
        usersCollection.document(userId).get()
            .addOnSuccessListener { document ->
                onResult(document.toObject<AppUser>())
            }
            .addOnFailureListener { onResult(null) }
    }
}
