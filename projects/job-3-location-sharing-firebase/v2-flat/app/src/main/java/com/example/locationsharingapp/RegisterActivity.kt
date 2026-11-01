package com.example.locationsharingapp

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.example.locationsharingapp.databinding.ActivityRegisterBinding
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.firebase.auth.FirebaseUser

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: AuthViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        binding.registerBtn.setOnClickListener {
            viewModel.register(
                binding.emailEt.text.toString(),
                binding.passwordEt.text.toString(),
                binding.nameEt.text.toString(),
                binding.dobEt.text.toString()
            )
        }

        viewModel.authState.observe(this) { user ->
            if (user != null) {
                checkLocationPermissionAndSave(user)
            }
        }

        viewModel.error.observe(this) {
            Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkLocationPermissionAndSave(user: FirebaseUser) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), 100)
        } else {
            saveLocationAndNavigate(user)
        }
    }

    private fun saveLocationAndNavigate(user: FirebaseUser) {
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                val lat = location?.latitude ?: 0.0
                val lon = location?.longitude ?: 0.0
                val appUser = AppUser(
                    user.uid,
                    user.email ?: "",
                    binding.nameEt.text.toString(),
                    binding.dobEt.text.toString(),
                    lat,
                    lon
                )
                viewModel.saveUserToFirestore(appUser)
                startActivity(Intent(this, FriendListActivity::class.java))
                finishAffinity()
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100 && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            val user = viewModel.authState.value
            if (user != null) saveLocationAndNavigate(user)
        }
    }
}
