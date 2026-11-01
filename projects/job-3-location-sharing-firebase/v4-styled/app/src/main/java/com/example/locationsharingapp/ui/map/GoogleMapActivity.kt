package com.example.locationsharingapp.ui.map

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.locationsharingapp.R
import com.example.locationsharingapp.data.model.User
import com.example.locationsharingapp.databinding.ActivityGoogleMapBinding
import com.example.locationsharingapp.util.Resource
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions

import com.google.android.gms.maps.model.MapStyleOptions

class GoogleMapActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivityGoogleMapBinding
    private val viewModel: MapViewModel by viewModels()
    private var googleMap: GoogleMap? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGoogleMapBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val mapFragment = supportFragmentManager.findFragmentById(R.id.mapFragment) as? SupportMapFragment
        mapFragment?.getMapAsync(this)

        binding.btnMapBack.setOnClickListener { finish() }
        binding.btnRefreshMap.setOnClickListener { viewModel.loadMapUsers() }
        observeViewModel()
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        
        // Apply unique dark system style to the map
        try {
            val success = map.setMapStyle(MapStyleOptions.loadRawResourceStyle(this, R.raw.map_style))
            if (!success) { /* Handle failure */ }
        } catch (e: Exception) { /* Handle error */ }

        googleMap?.uiSettings?.isZoomControlsEnabled = false
        googleMap?.uiSettings?.isMapToolbarEnabled = false
        
        viewModel.loadMapUsers()
    }

    private fun observeViewModel() {
        viewModel.mapUsersState.observe(this) { resource ->
            when (resource) {
                is Resource.Loading -> binding.progressBar.visibility = android.view.View.VISIBLE
                is Resource.Success -> {
                    binding.progressBar.visibility = android.view.View.GONE
                    val users = resource.data.orEmpty()
                    showUserMarkersOnMap(users)
                }
                is Resource.Error -> {
                    binding.progressBar.visibility = android.view.View.GONE
                }
            }
        }
    }

    private fun showUserMarkersOnMap(users: List<User>) {
        val map = googleMap ?: return
        map.clear()

        val usedPositions = mutableListOf<LatLng>()
        var firstMarker: com.google.android.gms.maps.model.Marker? = null

        for (user in users) {
            var lat = user.latitude
            var lng = user.longitude

            // Slight offset if locations are exact same to avoid overlapping
            while (usedPositions.any { Math.abs(it.latitude - lat) < 0.0001 && Math.abs(it.longitude - lng) < 0.0001 }) {
                lat += 0.0002
                lng += 0.0002
            }
            val latLng = LatLng(lat, lng)
            usedPositions.add(latLng)

            val markerOptions = MarkerOptions()
                .position(latLng)
                .title(user.name.ifEmpty { "Member" })
                .snippet("Live Trace Active")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_VIOLET))

            val marker = map.addMarker(markerOptions)
            if (firstMarker == null) firstMarker = marker
        }

        if (usedPositions.isNotEmpty()) {
            map.animateCamera(CameraUpdateFactory.newLatLngZoom(usedPositions.first(), 13.5f))
            firstMarker?.showInfoWindow()
        }
    }
}
