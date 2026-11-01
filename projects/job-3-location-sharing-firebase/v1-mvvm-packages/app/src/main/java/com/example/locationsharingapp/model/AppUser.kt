package com.example.locationsharingapp.model

data class AppUser(
    val userId: String = "",
    val userEmail: String = "",
    val displayName: String? = null,
    val phoneNumber: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)
