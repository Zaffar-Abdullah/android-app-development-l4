package com.example.locationsharingapp.ui.profile

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.locationsharingapp.databinding.ActivityMyProfileBinding
import com.example.locationsharingapp.util.LocationHelper
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch
import java.util.Locale

class MyProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMyProfileBinding
    private val viewModel: ProfileViewModel by viewModels()
    private lateinit var locationHelper: LocationHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        locationHelper = LocationHelper(this)

        setupListeners()
        observeViewModel()

        viewModel.loadProfile()
    }

    private fun setupListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnSaveProfile.setOnClickListener {
            val name = binding.etProfileName.text.toString()
            viewModel.updateProfile(name)
        }

        binding.btnDetectLocation.setOnClickListener {
            if (locationHelper.hasLocationPermission()) {
                lifecycleScope.launch {
                    binding.progressBar.visibility = View.VISIBLE
                    val location = locationHelper.getCurrentLocation()
                    if (location != null) {
                        viewModel.updateLocation(location.latitude, location.longitude)
                        Toast.makeText(
                            this@MyProfileActivity,
                            "Location Updated Successfully!",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        binding.progressBar.visibility = View.GONE
                        Toast.makeText(
                            this@MyProfileActivity,
                            "Failed to get current location",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } else {
                Toast.makeText(this, "Location permission not granted", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun observeViewModel() {
        viewModel.userProfileState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> binding.progressBar.visibility = View.VISIBLE
                is Resource.Success -> {
                    binding.progressBar.visibility = View.GONE
                    val user = resource.data
                    if (user != null) {
                        binding.etProfileName.setText(user.name)
                        binding.tvProfileEmail.text = "Email: ${user.email}"
                        binding.tvLatitude.text = String.format(Locale.getDefault(), "Latitude: %.6f", user.latitude)
                        binding.tvLongitude.text = String.format(Locale.getDefault(), "Longitude: %.6f", user.longitude)
                    }
                }
                is Resource.Error -> {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this, resource.message ?: "Error loading profile", Toast.LENGTH_SHORT).show()
                }
            }
        }

        viewModel.updateState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> binding.progressBar.visibility = View.VISIBLE
                is Resource.Success -> {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this, "Profile updated", Toast.LENGTH_SHORT).show()
                }
                is Resource.Error -> {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this, resource.message ?: "Update failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
