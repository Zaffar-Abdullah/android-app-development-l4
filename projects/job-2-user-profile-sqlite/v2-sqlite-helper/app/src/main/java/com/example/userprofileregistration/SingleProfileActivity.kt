package com.example.userprofileregistration

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity

class SingleProfileActivity : AppCompatActivity() {

    private val viewModel: ProfileViewModel by viewModels()
    private lateinit var profile: UserProfile

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_single_profile)

        profile = intent.getSerializableExtra("profile") as UserProfile

        val tvName = findViewById<TextView>(R.id.tvName)
        val tvEmail = findViewById<TextView>(R.id.tvEmail)
        val tvDob = findViewById<TextView>(R.id.tvDob)
        val tvDistrict = findViewById<TextView>(R.id.tvDistrict)
        val tvMobile = findViewById<TextView>(R.id.tvMobile)
        val btnEdit = findViewById<Button>(R.id.btnEdit)
        val btnDelete = findViewById<Button>(R.id.btnDelete)

        displayProfile()

        btnEdit.setOnClickListener {
            val intent = Intent(this, AddProfileActivity::class.java)
            intent.putExtra("profile", profile)
            startActivity(intent)
            finish() // Optional: finish current so we don't have stale data on return, or use onResume
        }

        btnDelete.setOnClickListener {
            viewModel.deleteProfile(profile.id)
            Toast.makeText(this, "Profile Deleted", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    private fun displayProfile() {
        findViewById<TextView>(R.id.tvName).text = getString(R.string.name_label, profile.name)
        findViewById<TextView>(R.id.tvEmail).text = getString(R.string.email_label, profile.email)
        findViewById<TextView>(R.id.tvDob).text = getString(R.string.dob_label, profile.dob)
        findViewById<TextView>(R.id.tvDistrict).text = getString(R.string.district_label, profile.district)
        findViewById<TextView>(R.id.tvMobile).text = getString(R.string.mobile_label, profile.mobile)
    }
}
