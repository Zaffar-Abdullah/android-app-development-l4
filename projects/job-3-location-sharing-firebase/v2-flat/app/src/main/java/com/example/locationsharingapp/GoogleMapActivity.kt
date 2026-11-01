package com.example.locationsharingapp

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.databinding.ActivityGoogleMapBinding
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions

class GoogleMapActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var binding: ActivityGoogleMapBinding
    private val viewModel: FriendListViewModel by viewModels()
    private var mMap: GoogleMap? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGoogleMapBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val mapFragment = supportFragmentManager.findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        viewModel.users.observe(this) { users ->
            updateMarkers(users)
        }
        viewModel.fetchUsers()
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        val users = viewModel.users.value
        if (users != null) updateMarkers(users)
    }

    private fun updateMarkers(users: List<AppUser>) {
        mMap?.let { map ->
            map.clear()
            for (user in users) {
                val pos = LatLng(user.latitude, user.longitude)
                val marker = map.addMarker(
                    MarkerOptions()
                        .position(pos)
                        .title("Location")
                        .snippet(user.displayName ?: "No Name")
                )
                marker?.showInfoWindow()
            }
            if (users.isNotEmpty()) {
                val lastUser = users.last()
                map.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(lastUser.latitude, lastUser.longitude), 10f))
            }
        }
    }
}
