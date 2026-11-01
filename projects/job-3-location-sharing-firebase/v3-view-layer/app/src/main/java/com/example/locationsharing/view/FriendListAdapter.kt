package com.example.locationsharing.view

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.locationsharing.databinding.ItemUserBinding
import com.example.locationsharing.model.AppUser

class FriendListAdapter(private var users: List<AppUser>) : RecyclerView.Adapter<FriendListAdapter.UserViewHolder>() {

    class UserViewHolder(val binding: ItemUserBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val binding = ItemUserBinding.inflate(layoutInflater, parent, false)
        return UserViewHolder(binding)
    }

    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        holder.binding.user = users[position]
        holder.binding.executePendingBindings()
    }

    override fun getItemCount(): Int = users.size

    fun updateUsers(newUsers: List<AppUser>) {
        users = newUsers
        notifyDataSetChanged()
    }
}
