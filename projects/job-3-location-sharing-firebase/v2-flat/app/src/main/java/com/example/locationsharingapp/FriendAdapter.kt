package com.example.locationsharingapp

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.locationsharingapp.databinding.ItemFriendBinding

class FriendAdapter(private var users: List<AppUser>) : RecyclerView.Adapter<FriendAdapter.ViewHolder>() {

    class ViewHolder(val binding: ItemFriendBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemFriendBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val user = users[position]
        holder.binding.nameTv.text = user.displayName ?: "Unknown"
        holder.binding.emailTv.text = user.userEmail
    }

    override fun getItemCount() = users.size

    fun updateData(newUsers: List<AppUser>) {
        users = newUsers
        notifyDataSetChanged()
    }
}
