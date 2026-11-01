package com.example.locationsharingapp.ui.friends

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.locationsharingapp.databinding.ActivityFriendListBinding
import com.example.locationsharingapp.ui.auth.AuthActivity
import com.example.locationsharingapp.ui.map.GoogleMapActivity
import com.example.locationsharingapp.ui.profile.MyProfileActivity
import com.example.locationsharingapp.util.Resource

class FriendListActivity : AppCompatActivity() {

    private lateinit var binding: ActivityFriendListBinding
    private val viewModel: FriendListViewModel by viewModels()
    private lateinit var adapter: UserAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFriendListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupListeners()
        observeViewModel()

        viewModel.loadUsers()
    }

    private fun setupRecyclerView() {
        adapter = UserAdapter { selectedUser ->
            val intent = Intent(this, GoogleMapActivity::class.java).apply {
                putExtra("TARGET_LAT", selectedUser.latitude)
                putExtra("TARGET_LNG", selectedUser.longitude)
                putExtra("TARGET_NAME", selectedUser.name.ifEmpty { selectedUser.email })
                putExtra("TARGET_EMAIL", selectedUser.email)
                putExtra("TARGET_UID", selectedUser.uid)
            }
            startActivity(intent)
        }
        binding.rvFriends.layoutManager = LinearLayoutManager(this)
        binding.rvFriends.adapter = adapter
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadUsers()
        }

        binding.btnNavMap.setOnClickListener {
            startActivity(Intent(this, GoogleMapActivity::class.java))
        }

        binding.btnNavProfile.setOnClickListener {
            startActivity(Intent(this, MyProfileActivity::class.java))
        }

        binding.btnNavLogout.setOnClickListener {
            viewModel.logout()
            startActivity(Intent(this, AuthActivity::class.java))
            finish()
        }
    }

    private fun observeViewModel() {
        viewModel.usersState.observe(this) { resource ->
            binding.swipeRefresh.isRefreshing = false
            when (resource) {
                is Resource.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                }
                is Resource.Success -> {
                    binding.progressBar.visibility = View.GONE
                    val users = resource.data.orEmpty()
                    adapter.submitList(users)
                    if (users.isEmpty()) {
                        binding.tvEmpty.visibility = View.VISIBLE
                    } else {
                        binding.tvEmpty.visibility = View.GONE
                    }
                }
                is Resource.Error -> {
                    binding.progressBar.visibility = View.GONE
                    Toast.makeText(this, resource.message ?: "Failed to load users", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadUsers()
    }
}
