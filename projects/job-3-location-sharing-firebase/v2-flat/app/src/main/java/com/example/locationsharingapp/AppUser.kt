package com.example.locationsharingapp

data class AppUser(
    val userId: String = "",
    val userEmail: String = "",
    var displayName: String? = null,
    val dob: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)
