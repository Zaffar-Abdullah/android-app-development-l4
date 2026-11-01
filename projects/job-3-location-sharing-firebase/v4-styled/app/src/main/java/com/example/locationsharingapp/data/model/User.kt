package com.example.locationsharingapp.data.model

data class User(
    val uid: String = "",
    val name: String = "",
    val email: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val updatedAt: Long = System.currentTimeMillis()
)
