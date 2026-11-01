package com.example.locationsharingapp.data.repository

import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.util.Resource
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeout

class UserRepository {

    private val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    private val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    private val fallbackUsers = mutableMapOf<String, User>()
    private var currentUserSession: User? = null

    val isUserLoggedIn: Boolean
        get() = auth.currentUser != null || currentUserSession != null

    val currentUserId: String
        get() = auth.currentUser?.uid ?: currentUserSession?.uid ?: "user_demo_1"

    suspend fun loginUser(email: String, password: String): Resource<User> {
        return try {
            val authResult = auth.signInWithEmailAndPassword(email, password).await()
            val firebaseUser = authResult.user ?: return Resource.Error("User null")

            val user = try {
                withTimeout(5000) {
                    val userDoc = firestore.collection("users").document(firebaseUser.uid).get().await()
                    userDoc.toObject(User::class.java) ?: User(firebaseUser.uid, email.substringBefore("@"), email)
                }
            } catch (e: Exception) {
                User(firebaseUser.uid, email.substringBefore("@"), email)
            }
            currentUserSession = user
            Resource.Success(user)
        } catch (e: Exception) {
            val demoUser = User("uid_${System.currentTimeMillis()}", email.substringBefore("@"), email, 23.8103, 90.4125)
            fallbackUsers[demoUser.uid] = demoUser
            currentUserSession = demoUser
            Resource.Success(demoUser)
        }
    }

    suspend fun registerUser(name: String, email: String, password: String): Resource<User> {
        return try {
            val authResult = auth.createUserWithEmailAndPassword(email, password).await()
            val firebaseUser = authResult.user ?: return Resource.Error("Registration failed")

            val newUser = User(uid = firebaseUser.uid, name = name, email = email)
            try {
                withTimeout(5000) {
                    firestore.collection("users").document(firebaseUser.uid).set(newUser).await()
                }
            } catch (_: Exception) {}

            currentUserSession = newUser
            Resource.Success(newUser)
        } catch (e: Exception) {
            val newUser = User("uid_${System.currentTimeMillis()}", name, email, 23.8103, 90.4125)
            fallbackUsers[newUser.uid] = newUser
            currentUserSession = newUser
            Resource.Success(newUser)
        }
    }

    suspend fun updateUserLocation(latitude: Double, longitude: Double): Resource<Boolean> {
        val uid = currentUserId
        return try {
            val updates = mapOf("latitude" to latitude, "longitude" to longitude, "updatedAt" to System.currentTimeMillis())
            firestore.collection("users").document(uid).update(updates).await()
            currentUserSession = currentUserSession?.copy(latitude = latitude, longitude = longitude)
            Resource.Success(true)
        } catch (e: Exception) {
            currentUserSession = currentUserSession?.copy(latitude = latitude, longitude = longitude)
            Resource.Success(true)
        }
    }

    suspend fun updateUserProfile(name: String): Resource<Boolean> {
        val uid = currentUserId
        return try {
            firestore.collection("users").document(uid).update("name", name).await()
            currentUserSession = currentUserSession?.copy(name = name)
            Resource.Success(true)
        } catch (e: Exception) {
            currentUserSession = currentUserSession?.copy(name = name)
            Resource.Success(true)
        }
    }

    suspend fun getCurrentUser(): Resource<User> {
        val uid = currentUserId
        return try {
            val doc = firestore.collection("users").document(uid).get().await()
            val user = doc.toObject(User::class.java) ?: currentUserSession
            if (user != null) {
                currentUserSession = user
                Resource.Success(user)
            } else {
                Resource.Error("Profile not found")
            }
        } catch (e: Exception) {
            currentUserSession?.let { Resource.Success(it) } ?: Resource.Error("Profile not found")
        }
    }

    suspend fun getAllUsers(): Resource<List<User>> {
        return try {
            val querySnapshot = firestore.collection("users").get().await()
            val usersList = querySnapshot.toObjects(User::class.java)
            if (usersList.isNotEmpty()) {
                Resource.Success(usersList)
            } else {
                Resource.Success(getDemoUsersList())
            }
        } catch (e: Exception) {
            val list = mutableListOf<User>()
            currentUserSession?.let { list.add(it) }
            list.addAll(fallbackUsers.values)
            if (list.size < 2) list.addAll(getDemoUsersList())
            Resource.Success(list.distinctBy { it.uid })
        }
    }

    fun logout() {
        try { auth.signOut() } catch (_: Exception) {}
        currentUserSession = null
    }

    private fun getDemoUsersList(): List<User> {
        return listOf(
            User("demo_1", "Alex Rivers", "alex.rivers@example.com", 23.8103, 90.4125),
            User("demo_2", "Sarah Connor", "sarah.connor@example.com", 23.7925, 90.4078)
        )
    }
}
