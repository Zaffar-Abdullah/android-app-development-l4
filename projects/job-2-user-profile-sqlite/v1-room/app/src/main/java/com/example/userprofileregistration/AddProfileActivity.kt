package com.example.userprofileregistration

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.userprofileregistration.databinding.ActivityAddProfileBinding

class AddProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddProfileBinding
    private val viewModel: UserProfileViewModel by viewModels()
    private var profileId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        profileId = intent.getIntExtra("PROFILE_ID", -1)
        if (profileId != -1) {
            binding.toolbar.title = "Edit Profile"
            viewModel.getProfileById(profileId).observe(this) { profile ->
                profile?.let {
                    binding.etName.setText(it.name)
                    binding.etEmail.setText(it.email)
                    binding.etDob.setText(it.dob)
                    binding.etDistrict.setText(it.district)
                    binding.etMobile.setText(it.mobile)
                }
            }
        }

        binding.btnSave.setOnClickListener {
            val name = binding.etName.text.toString()
            val email = binding.etEmail.text.toString()
            val dob = binding.etDob.text.toString()
            val district = binding.etDistrict.text.toString()
            val mobile = binding.etMobile.text.toString()

            if (name.isBlank() || email.isBlank()) {
                Toast.makeText(this, "Name and Email are required", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val profile = UserProfile(
                id = if (profileId == -1) 0 else profileId,
                name = name,
                email = email,
                dob = dob,
                district = district,
                mobile = mobile
            )

            if (profileId == -1) {
                viewModel.insert(profile)
                Toast.makeText(this, "Profile Saved", Toast.LENGTH_SHORT).show()
            } else {
                viewModel.update(profile)
                Toast.makeText(this, "Profile Updated", Toast.LENGTH_SHORT).show()
            }
            finish()
        }
    }
}
