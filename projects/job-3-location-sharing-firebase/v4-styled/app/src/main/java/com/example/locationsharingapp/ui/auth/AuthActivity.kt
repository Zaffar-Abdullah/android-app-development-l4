package com.example.locationsharingapp.ui.auth

import android.Manifest
import android.content.Intent
import android.os.Bundle
import android.transition.TransitionManager
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doOnTextChanged
import androidx.lifecycle.lifecycleScope
import com.example.locationsharingapp.R
import com.example.locationsharingapp.databinding.ActivityAuthBinding
import com.example.locationsharingapp.ui.friends.FriendListActivity
import com.example.locationsharingapp.util.LocationHelper
import com.example.locationsharingapp.util.Resource
import kotlinx.coroutines.launch

class AuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAuthBinding
    private val viewModel: AuthViewModel by viewModels()
    private lateinit var locationHelper: LocationHelper

    private var isRegisterMode = false

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        detectAndSaveLocation()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        locationHelper = LocationHelper(this)

        if (viewModel.checkUserLoggedIn()) {
            navigateToFriendList()
            return
        }

        setupUI()
        observeViewModel()
        setupValidation()
    }

    private fun setupUI() {
        binding.btnSubmit.setOnClickListener {
            if (validateInputs()) {
                val email = binding.etEmail.text.toString().trim()
                val password = binding.etPassword.text.toString().trim()

                if (isRegisterMode) {
                    val name = binding.etName.text.toString().trim()
                    viewModel.register(name, email, password)
                } else {
                    viewModel.login(email, password)
                }
            }
        }

        binding.tvSwitchMode.setOnClickListener {
            isRegisterMode = !isRegisterMode
            
            // Smooth system transition for UI changes
            TransitionManager.beginDelayedTransition(binding.root as ViewGroup)
            
            if (isRegisterMode) {
                binding.tvFormTitle.text = getString(R.string.title_register)
                binding.tilName.visibility = View.VISIBLE
                binding.btnSubmit.text = getString(R.string.btn_register)
                binding.tvSwitchMode.text = getString(R.string.btn_switch_login)
            } else {
                binding.tvFormTitle.text = getString(R.string.title_login)
                binding.tilName.visibility = View.GONE
                binding.btnSubmit.text = getString(R.string.btn_login)
                binding.tvSwitchMode.text = getString(R.string.btn_switch_register)
            }
        }
    }

    private fun setupValidation() {
        binding.etEmail.doOnTextChanged { _, _, _, _ -> binding.tilEmail.error = null }
        binding.etPassword.doOnTextChanged { _, _, _, _ -> binding.tilPassword.error = null }
        binding.etName.doOnTextChanged { _, _, _, _ -> binding.tilName.error = null }
    }

    private fun validateInputs(): Boolean {
        var isValid = true
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        if (email.isEmpty()) {
            binding.tilEmail.error = "Email is required"
            isValid = false
        }
        if (password.length < 6) {
            binding.tilPassword.error = "Password must be at least 6 characters"
            isValid = false
        }
        if (isRegisterMode && binding.etName.text.toString().trim().isEmpty()) {
            binding.tilName.error = "Name is required"
            isValid = false
        }
        return isValid
    }

    private fun observeViewModel() {
        viewModel.authState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.btnSubmit.isEnabled = false
                }
                is Resource.Success -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnSubmit.isEnabled = true
                    Toast.makeText(this, "Welcome!", Toast.LENGTH_SHORT).show()
                    requestLocationAndProceed()
                }
                is Resource.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnSubmit.isEnabled = true
                    Toast.makeText(this, resource.message ?: "Access Denied", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun requestLocationAndProceed() {
        if (locationHelper.hasLocationPermission()) {
            detectAndSaveLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    private fun detectAndSaveLocation() {
        lifecycleScope.launch {
            val location = locationHelper.getCurrentLocation()
            if (location != null) {
                viewModel.updateLocation(location.latitude, location.longitude)
            }
            navigateToFriendList()
        }
    }

    private fun navigateToFriendList() {
        startActivity(Intent(this, FriendListActivity::class.java))
        finish()
    }
}
