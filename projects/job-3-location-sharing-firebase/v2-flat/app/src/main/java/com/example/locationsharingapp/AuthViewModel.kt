package com.example.locationsharingapp

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    private val _authState = MutableLiveData<FirebaseUser?>()
    val authState: LiveData<FirebaseUser?> = _authState

    private val _error = MutableLiveData<String>()
    val error: LiveData<String> = _error

    fun login(email: String, pass: String) {
        if (email.isEmpty() || pass.isEmpty()) {
            _error.value = "Please fill all fields"
            return
        }
        auth.signInWithEmailAndPassword(email, pass)
            .addOnSuccessListener { _authState.value = it.user }
            .addOnFailureListener { _error.value = it.message }
    }

    fun register(email: String, pass: String, name: String, dob: String) {
        if (email.isEmpty() || pass.isEmpty() || name.isEmpty() || dob.isEmpty()) {
            _error.value = "Please fill all fields"
            return
        }
        auth.createUserWithEmailAndPassword(email, pass)
            .addOnSuccessListener { _authState.value = it.user }
            .addOnFailureListener { _error.value = it.message }
    }

    fun saveUserToFirestore(user: AppUser) {
        db.collection("AppUsers").document(user.userId).set(user)
            .addOnFailureListener { _error.value = it.message }
    }

    fun updateLocation(uid: String, lat: Double, lon: Double) {
        val updates = mapOf(
            "latitude" to lat,
            "longitude" to lon
        )
        db.collection("AppUsers").document(uid).update(updates)
            .addOnFailureListener { _error.value = it.message }
    }
}
