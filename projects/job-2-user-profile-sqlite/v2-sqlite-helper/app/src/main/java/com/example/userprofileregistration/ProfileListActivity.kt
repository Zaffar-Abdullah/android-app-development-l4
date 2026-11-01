package com.example.userprofileregistration

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class ProfileListActivity : AppCompatActivity() {

    private val viewModel: ProfileViewModel by viewModels()
    private lateinit var adapter: ProfileAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile_list)

        val tvTotalProfiles = findViewById<TextView>(R.id.tvTotalProfiles)
        val recyclerView = findViewById<RecyclerView>(R.id.recyclerView)
        val btnAddProfile = findViewById<Button>(R.id.btnAddProfile)

        adapter = ProfileAdapter(emptyList()) { profile ->
            val intent = Intent(this, SingleProfileActivity::class.java)
            intent.putExtra("profile", profile)
            startActivity(intent)
        }

        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        btnAddProfile.setOnClickListener {
            startActivity(Intent(this, AddProfileActivity::class.java))
        }

        viewModel.profiles.observe(this) { profiles ->
            adapter.updateData(profiles)
            tvTotalProfiles.text = getString(R.string.total_profiles, profiles.size)
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadProfiles()
    }
}
