package com.example.locationsharing.view

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Redirect to AuthActivity
        startActivity(Intent(this, AuthActivity::class.java))
        finish()
    }
}
