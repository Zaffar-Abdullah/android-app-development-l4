package com.example.userprofileregistration

import android.app.DatePickerDialog
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import java.util.*

class AddProfileActivity : AppCompatActivity() {

    private val viewModel: ProfileViewModel by viewModels()
    private var existingProfile: UserProfile? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_profile)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etDob = findViewById<EditText>(R.id.etDob)
        val etDistrict = findViewById<EditText>(R.id.etDistrict)
        val etMobile = findViewById<EditText>(R.id.etMobile)
        val btnSave = findViewById<Button>(R.id.btnSave)

        etDob.setOnClickListener {
            showDatePicker(etDob)
        }

        existingProfile = intent.getSerializableExtra("profile") as? UserProfile
        if (existingProfile != null) {
            etName.setText(existingProfile?.name)
            etEmail.setText(existingProfile?.email)
            etDob.setText(existingProfile?.dob)
            etDistrict.setText(existingProfile?.district)
            etMobile.setText(existingProfile?.mobile)
            btnSave.setText(R.string.update)
        }

        btnSave.setOnClickListener {
            val name = etName.text.toString()
            val email = etEmail.text.toString()
            val dob = etDob.text.toString()
            val district = etDistrict.text.toString()
            val mobile = etMobile.text.toString()

            if (name.isNotEmpty() && email.isNotEmpty()) {
                if (existingProfile == null) {
                    val profile = UserProfile(name = name, email = email, dob = dob, district = district, mobile = mobile)
                    viewModel.addProfile(profile)
                    Toast.makeText(this, "Profile Saved", Toast.LENGTH_SHORT).show()
                } else {
                    val profile = UserProfile(id = existingProfile!!.id, name = name, email = email, dob = dob, district = district, mobile = mobile)
                    viewModel.updateProfile(profile)
                    Toast.makeText(this, "Profile Updated", Toast.LENGTH_SHORT).show()
                }
                finish()
            } else {
                Toast.makeText(this, "Please fill Name and Email", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showDatePicker(editText: EditText) {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        val datePickerDialog = DatePickerDialog(
            this,
            { _, selectedYear, selectedMonth, selectedDay ->
                val date = "$selectedDay/${selectedMonth + 1}/$selectedYear"
                editText.setText(date)
            },
            year,
            month,
            day
        )
        datePickerDialog.show()
    }
}
