package com.example.locationsharing.view

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharing.R
import com.example.locationsharing.viewmodel.GoogleMapViewModel
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MarkerOptions

class GoogleMapActivity : AppCompatActivity(), OnMapReadyCallback {
    private lateinit var mMap: GoogleMap
    private val googleMapViewModel: GoogleMapViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_google_map)

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap

        googleMapViewModel.userList.observe(this) { users ->
            if (users.isNullOrEmpty()) return@observe

            mMap.clear()
            val builder = LatLngBounds.Builder()
            
            for (user in users) {
                val pos = LatLng(user.latitude, user.longitude)
                mMap.addMarker(
                    MarkerOptions()
                        .position(pos)
                        .title(user.userEmail)
                        .snippet("User: ${user.displayName ?: "No Name"}")
                )
                builder.include(pos)
            }

            val bounds = builder.build()
            val padding = 150 // offset from edges of the map in pixels

            if (users.size == 1) {
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(bounds.center, 15f))
            } else {
                mMap.animateCamera(CameraUpdateFactory.newLatLngBounds(bounds, padding))
            }
        }

        googleMapViewModel.fetchAllUsers()
    }
}
