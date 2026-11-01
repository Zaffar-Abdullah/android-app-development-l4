package com.example.locationsharingapp

import android.content.Intent
import android.os.Bundle
import android.widget.PopupMenu
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.databinding.ActivityFriendListBinding
import com.google.firebase.auth.FirebaseAuth

class FriendListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFriendListBinding
    private val viewModel: FriendListViewModel by viewModels()
    private lateinit var adapter: FriendAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFriendListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        adapter = FriendAdapter(emptyList())
        binding.recyclerView.adapter = adapter

        viewModel.users.observe(this) { users ->
            adapter.updateData(users)
        }

        viewModel.fetchUsers()

        binding.fabMenu.setOnClickListener {
            showPopupMenu()
        }
    }

    private fun showPopupMenu() {
        val popup = PopupMenu(this, binding.fabMenu)
        popup.menu.add(getString(R.string.menu_my_profile))
        popup.menu.add(getString(R.string.menu_show_map))
        popup.menu.add(getString(R.string.menu_logout))

        popup.setOnMenuItemClickListener { item ->
            when (item.title) {
                getString(R.string.menu_my_profile) -> {
                    startActivity(Intent(this, MyProfileActivity::class.java))
                }
                getString(R.string.menu_show_map) -> {
                    startActivity(Intent(this, GoogleMapActivity::class.java))
                }
                getString(R.string.menu_logout) -> {
                    FirebaseAuth.getInstance().signOut()
                    startActivity(Intent(this, AuthActivity::class.java))
                    finish()
                }
            }
            true
        }
        popup.show()
    }
}
