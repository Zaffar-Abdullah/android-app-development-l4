package com.example.locationsharingapp.ui

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.databinding.ActivityMyProfileBinding
import com.example.locationsharingapp.viewmodel.ProfileViewModel

class MyProfileActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMyProfileBinding
    private val viewModel: ProfileViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.user.observe(this) { user ->
            user?.let {
                binding.etProfileName.setText(it.displayName)
                binding.etProfilePhone.setText(it.phoneNumber)
                binding.tvProfileEmail.text = "Email: ${it.userEmail}"
                binding.tvProfileLat.text = "Latitude: ${it.latitude}"
                binding.tvProfileLon.text = "Longitude: ${it.longitude}"
            }
        }

        viewModel.updateStatus.observe(this) { success ->
            if (success) {
                Toast.makeText(this, "Profile updated successfully", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Update failed", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnUpdateProfile.setOnClickListener {
            val newName = binding.etProfileName.text.toString()
            val newPhone = binding.etProfilePhone.text.toString()
            if (newName.isNotEmpty() && newPhone.isNotEmpty()) {
                viewModel.updateProfile(newName, newPhone)
            } else {
                Toast.makeText(this, "Name and Phone cannot be empty", Toast.LENGTH_SHORT).show()
            }
        }

        viewModel.fetchCurrentUser()
    }
}
