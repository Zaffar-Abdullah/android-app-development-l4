package com.example.locationsharingapp.ui

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.R
import com.example.locationsharingapp.viewmodel.MapViewModel
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.example.locationsharingapp.repository.UserRepository

class GoogleMapActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var mMap: GoogleMap
    private val viewModel: MapViewModel by viewModels()
    private val repository = UserRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_google_map)

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        val currentUserId = repository.getCurrentUserId()

        if (androidx.core.content.ContextCompat.checkSelfPermission(
                this,
                android.Manifest.permission.ACCESS_FINE_LOCATION
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            mMap.isMyLocationEnabled = true
        }

        viewModel.users.observe(this) { users ->
            mMap.clear()
            users.forEach { user ->
                val location = LatLng(user.latitude, user.longitude)
                val isMe = user.userId == currentUserId
                val title = if (isMe) "${user.displayName ?: "No Name"} (Me)" else (user.displayName ?: "No Name")
                
                mMap.addMarker(
                    MarkerOptions()
                        .position(location)
                        .title(title)
                        .snippet("Phone: ${user.phoneNumber}")
                        .icon(BitmapDescriptorFactory.defaultMarker(
                            if (isMe) BitmapDescriptorFactory.HUE_GREEN else BitmapDescriptorFactory.HUE_RED
                        ))
                )
            }
            
            // Move camera to current user if available, otherwise first user
            val focusUser = users.find { it.userId == currentUserId } ?: users.firstOrNull()
            focusUser?.let {
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(LatLng(it.latitude, it.longitude), 15f))
            }
        }

        viewModel.fetchUsers()
    }
}
