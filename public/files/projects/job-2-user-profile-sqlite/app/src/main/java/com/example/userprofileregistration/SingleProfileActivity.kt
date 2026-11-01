package com.example.userprofileregistration

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.userprofileregistration.databinding.ActivitySingleProfileBinding

class SingleProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySingleProfileBinding
    private val viewModel: UserProfileViewModel by viewModels()
    private var profileId: Int = -1
    private var currentProfile: UserProfile? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySingleProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        profileId = intent.getIntExtra("PROFILE_ID", -1)
        if (profileId == -1) {
            finish()
            return
        }

        viewModel.getProfileById(profileId).observe(this) { profile ->
            currentProfile = profile
            profile?.let {
                binding.tvDetailName.text = "Name: ${it.name}"
                binding.tvDetailEmail.text = "Email: ${it.email}"
                binding.tvDetailDob.text = "DOB: ${it.dob}"
                binding.tvDetailDistrict.text = "District: ${it.district}"
                binding.tvDetailMobile.text = "Mobile: ${it.mobile}"
            }
        }

        binding.btnEdit.setOnClickListener {
            val intent = Intent(this, AddProfileActivity::class.java)
            intent.putExtra("PROFILE_ID", profileId)
            startActivity(intent)
        }

        binding.btnDelete.setOnClickListener {
            currentProfile?.let {
                viewModel.delete(it)
                Toast.makeText(this, "Profile Deleted", Toast.LENGTH_SHORT).show()
                finish()
            }
        }
    }
}
