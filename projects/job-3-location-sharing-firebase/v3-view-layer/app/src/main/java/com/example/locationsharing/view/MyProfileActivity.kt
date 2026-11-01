package com.example.locationsharing.view

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.databinding.DataBindingUtil
import com.example.locationsharing.R
import com.example.locationsharing.databinding.ActivityMyProfileBinding
import com.example.locationsharing.viewmodel.MyProfileViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class MyProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMyProfileBinding
    private val myProfileViewModel: MyProfileViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_my_profile)
        binding.lifecycleOwner = this
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        myProfileViewModel.currentUser.observe(this) { user ->
            binding.user = user
        }

        myProfileViewModel.updateStatus.observe(this) { success ->
            if (success) {
                Toast.makeText(this, "Profile Updated", Toast.LENGTH_SHORT).show()
            }
        }

        myProfileViewModel.fetchCurrentUser()

        binding.btnUpdate.setOnClickListener {
            val newName = binding.etName.text.toString()
            if (newName.isNotEmpty()) {
                myProfileViewModel.updateDisplayName(newName)
            }
        }

        binding.btnUpdateLocation.setOnClickListener {
            updateLocation()
        }
    }

    private fun updateLocation() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                101
            )
            return
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            if (location != null) {
                myProfileViewModel.updateLocation(location.latitude, location.longitude)
                Toast.makeText(this, "Location Updated", Toast.LENGTH_SHORT).show()
                myProfileViewModel.fetchCurrentUser()
            }
        }
    }
}
