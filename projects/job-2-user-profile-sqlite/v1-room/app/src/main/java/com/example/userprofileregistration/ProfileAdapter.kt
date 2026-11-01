package com.example.userprofileregistration

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.userprofileregistration.databinding.ItemProfileBinding

class ProfileAdapter(private val onItemClick: (UserProfile) -> Unit) :
    ListAdapter<UserProfile, ProfileAdapter.ProfileViewHolder>(ProfileDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProfileViewHolder {
        val binding = ItemProfileBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ProfileViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ProfileViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ProfileViewHolder(private val binding: ItemProfileBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(profile: UserProfile) {
            binding.tvName.text = profile.name
            binding.tvEmail.text = profile.email
            binding.root.setOnClickListener { onItemClick(profile) }
        }
    }

    class ProfileDiffCallback : DiffUtil.ItemCallback<UserProfile>() {
        override fun areItemsTheSame(oldItem: UserProfile, newItem: UserProfile) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: UserProfile, newItem: UserProfile) = oldItem == newItem
    }
}
