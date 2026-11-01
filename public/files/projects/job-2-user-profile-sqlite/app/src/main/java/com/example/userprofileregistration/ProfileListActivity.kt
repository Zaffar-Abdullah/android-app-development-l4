package com.example.userprofileregistration

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.userprofileregistration.databinding.ActivityProfileListBinding

class ProfileListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileListBinding
    private val viewModel: UserProfileViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val adapter = ProfileAdapter { profile ->
            val intent = Intent(this, SingleProfileActivity::class.java)
            intent.putExtra("PROFILE_ID", profile.id)
            startActivity(intent)
        }

        binding.rvProfiles.layoutManager = LinearLayoutManager(this)
        binding.rvProfiles.adapter = adapter

        viewModel.allProfiles.observe(this) { profiles ->
            adapter.submitList(profiles)
            binding.tvTotalProfiles.text = "Total Profiles: ${profiles.size}"
        }

        binding.fabAdd.setOnClickListener {
            startActivity(Intent(this, AddProfileActivity::class.java))
        }
    }
}
