package com.example.locationsharingapp.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.locationsharingapp.databinding.ItemUserBinding
import com.example.locationsharingapp.model.AppUser

class UserAdapter(
    private var users: List<AppUser>,
    private val currentUserId: String? = null
) : RecyclerView.Adapter<UserAdapter.UserViewHolder>() {

    class UserViewHolder(val binding: ItemUserBinding) : RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {
        val binding = ItemUserBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return UserViewHolder(binding)
    }

    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {
        val user = users[position]
        val isMe = user.userId == currentUserId
        holder.binding.tvUserName.text = if (isMe) "${user.displayName ?: "No Name"} (Me)" else (user.displayName ?: "No Name")
        holder.binding.tvUserEmail.text = user.userEmail
        holder.binding.tvUserPhone.text = user.phoneNumber
        
        if (isMe) {
            holder.binding.tvUserName.setTextColor(holder.itemView.context.getColor(com.example.locationsharingapp.R.color.green_primary))
        } else {
            holder.binding.tvUserName.setTextColor(holder.itemView.context.getColor(com.example.locationsharingapp.R.color.black))
        }
    }

    override fun getItemCount(): Int = users.size

    fun updateData(newUsers: List<AppUser>) {
        users = newUsers
        notifyDataSetChanged()
    }
}
