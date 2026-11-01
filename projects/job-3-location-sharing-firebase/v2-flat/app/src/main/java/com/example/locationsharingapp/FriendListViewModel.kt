package com.example.locationsharingapp

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.firestore.FirebaseFirestore

class FriendListViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val _users = MutableLiveData<List<AppUser>>()
    val users: LiveData<List<AppUser>> = _users

    fun fetchUsers() {
        db.collection("AppUsers").addSnapshotListener { snapshot, _ ->
            val userList = snapshot?.toObjects(AppUser::class.java) ?: emptyList()
            _users.value = userList
        }
    }
}
