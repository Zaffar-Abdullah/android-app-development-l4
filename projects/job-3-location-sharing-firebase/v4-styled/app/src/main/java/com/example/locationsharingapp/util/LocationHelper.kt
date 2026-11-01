package com.example.locationsharingapp.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withTimeoutOrNull

class LocationHelper(private val context: Context) {

    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    suspend fun getCurrentLocation(): Location? {
        if (!hasLocationPermission()) return null
        return try {
            val token = CancellationTokenSource().token
            val location = withTimeoutOrNull(3000) {
                fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, token).await()
            }
            location ?: getLastKnownLocation()
        } catch (e: Exception) {
            getLastKnownLocation()
        }
    }

    private suspend fun getLastKnownLocation(): Location? {
        if (!hasLocationPermission()) return null
        return try {
            withTimeoutOrNull(2000) { fusedLocationClient.lastLocation.await() }
        } catch (e: Exception) { null }
    }
}
