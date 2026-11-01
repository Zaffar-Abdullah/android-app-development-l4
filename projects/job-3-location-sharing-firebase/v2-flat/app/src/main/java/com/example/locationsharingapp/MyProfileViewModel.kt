package com.example.locationsharingapp

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class MyProfileViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    
    private val _currentUser = MutableLiveData<AppUser?>()
    val currentUser: LiveData<AppUser?> = _currentUser

    fun fetchCurrentUser() {
        val uid = auth.currentUser?.uid ?: return
        db.collection("AppUsers").document(uid).get()
            .addOnSuccessListener { _currentUser.value = it.toObject(AppUser::class.java) }
    }

    fun updateDisplayName(name: String) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("AppUsers").document(uid).update("displayName", name)
            .addOnSuccessListener { fetchCurrentUser() }
    }
}
