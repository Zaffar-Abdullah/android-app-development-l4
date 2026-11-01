package com.example.userprofileregistration

import java.io.Serializable

data class UserProfile(
    val id: Int = 0,
    val name: String,
    val email: String,
    val dob: String,
    val district: String,
    val mobile: String
) : Serializable
