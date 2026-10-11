package com.example.locationsharingapp.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.databinding.ActivityAuthBinding
import com.example.locationsharingapp.viewmodel.AuthViewModel

class AuthActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAuthBinding
    private val viewModel: AuthViewModel by viewModels()
    private var isLoginMode = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.checkLoginStatus()

        binding.tvToggle.setOnClickListener {
            isLoginMode = !isLoginMode
            updateUI()
        }

        binding.btnSubmit.setOnClickListener {
            val email = binding.etEmail.text.toString()
            val password = binding.etPassword.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (isLoginMode) {
                viewModel.signIn(email, password)
            } else {
                val name = binding.etName.text.toString()
                val phone = binding.etPhone.text.toString()
                if (name.isEmpty() || phone.isEmpty()) {
                    Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                // Initial location will be updated later, setting 0.0 for now
                viewModel.signUp(email, password, name, phone, 0.0, 0.0)
            }
        }

        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthViewModel.AuthState.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.btnSubmit.isEnabled = false
                }
                is AuthViewModel.AuthState.Success -> {
                    startActivity(Intent(this, FriendListActivity::class.java))
                    finish()
                }
                is AuthViewModel.AuthState.Error -> {
                    binding.progressBar.visibility = View.GONE
                    binding.btnSubmit.isEnabled = true
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun updateUI() {
        if (isLoginMode) {
            binding.tilName.visibility = View.GONE
            binding.tilPhone.visibility = View.GONE
            binding.tvTitle.text = "Login"
            binding.btnSubmit.text = "Login"
            binding.tvToggle.text = "Don't have an account? Register"
        } else {
            binding.tilName.visibility = View.VISIBLE
            binding.tilPhone.visibility = View.VISIBLE
            binding.tvTitle.text = "Register"
            binding.btnSubmit.text = "Register"
            binding.tvToggle.text = "Already have an account? Login"
        }
    }
}
