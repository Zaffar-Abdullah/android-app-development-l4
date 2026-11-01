package com.example.locationsharingapp

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.databinding.ActivityMyProfileBinding

class MyProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMyProfileBinding
    private val viewModel: MyProfileViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMyProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.currentUser.observe(this) { user ->
            if (user != null) {
                binding.displayNameEt.setText(user.displayName)
                binding.emailTv.text = getString(R.string.email_label, user.userEmail)
                binding.latTv.text = getString(R.string.latitude) + user.latitude
                binding.lonTv.text = getString(R.string.longitude) + user.longitude
            }
        }

        viewModel.fetchCurrentUser()

        binding.updateBtn.setOnClickListener {
            val newName = binding.displayNameEt.text.toString()
            if (newName.isNotEmpty()) {
                viewModel.updateDisplayName(newName)
            }
        }
    }
}
