package com.example.locationsharing.view

import android.content.Intent
import android.os.Bundle
import android.widget.PopupMenu
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import com.example.locationsharing.R
import com.example.locationsharing.databinding.ActivityFriendListBinding
import com.example.locationsharing.viewmodel.AuthViewModel
import com.example.locationsharing.viewmodel.FriendListViewModel

class FriendListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityFriendListBinding
    private val friendListViewModel: FriendListViewModel by viewModels()
    private val authViewModel: AuthViewModel by viewModels()
    private lateinit var adapter: FriendListAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_friend_list)
        binding.lifecycleOwner = this

        adapter = FriendListAdapter(emptyList())
        binding.rvFriends.adapter = adapter

        friendListViewModel.userList.observe(this) { users ->
            adapter.updateUsers(users)
        }

        friendListViewModel.fetchAllUsers()

        binding.fabMenu.setOnClickListener {
            showPopupMenu()
        }
    }

    private fun showPopupMenu() {
        val popup = PopupMenu(this, binding.fabMenu)
        val MY_PROFILE = 1
        val SHOW_MAP = 2
        val LOGOUT = 3

        popup.menu.add(0, MY_PROFILE, 0, "My Profile")
        popup.menu.add(0, SHOW_MAP, 1, "Show users on Map")
        popup.menu.add(0, LOGOUT, 2, "Logout")

        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                MY_PROFILE -> {
                    startActivity(Intent(this, MyProfileActivity::class.java))
                }
                SHOW_MAP -> {
                    startActivity(Intent(this, GoogleMapActivity::class.java))
                }
                LOGOUT -> {
                    authViewModel.logout()
                    startActivity(Intent(this, AuthActivity::class.java))
                    finish()
                }
            }
            true
        }
        popup.show()
    }
}
