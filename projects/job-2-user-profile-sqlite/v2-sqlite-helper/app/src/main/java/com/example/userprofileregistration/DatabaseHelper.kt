package com.example.userprofileregistration

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "user_profiles.db"
        private const val DATABASE_VERSION = 1
        private const val TABLE_NAME = "profiles"
        private const val COLUMN_ID = "id"
        private const val COLUMN_NAME = "name"
        private const val COLUMN_EMAIL = "email"
        private const val COLUMN_DOB = "dob"
        private const val COLUMN_DISTRICT = "district"
        private const val COLUMN_MOBILE = "mobile"
    }

    override fun onCreate(db: SQLiteDatabase?) {
        val createTable = ("CREATE TABLE $TABLE_NAME (" +
                "$COLUMN_ID INTEGER PRIMARY KEY AUTOINCREMENT," +
                "$COLUMN_NAME TEXT," +
                "$COLUMN_EMAIL TEXT," +
                "$COLUMN_DOB TEXT," +
                "$COLUMN_DISTRICT TEXT," +
                "$COLUMN_MOBILE TEXT)")
        db?.execSQL(createTable)
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_NAME")
        onCreate(db)
    }

    fun addProfile(profile: UserProfile): Long {
        val db = this.writableDatabase
        val values = ContentValues()
        values.put(COLUMN_NAME, profile.name)
        values.put(COLUMN_EMAIL, profile.email)
        values.put(COLUMN_DOB, profile.dob)
        values.put(COLUMN_DISTRICT, profile.district)
        values.put(COLUMN_MOBILE, profile.mobile)
        return db.insert(TABLE_NAME, null, values)
    }

    fun getAllProfiles(): List<UserProfile> {
        val profiles = mutableListOf<UserProfile>()
        val db = this.readableDatabase
        val cursor = db.rawQuery("SELECT * FROM $TABLE_NAME", null)
        if (cursor.moveToFirst()) {
            do {
                val profile = UserProfile(
                    cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                    cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_NAME)),
                    cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EMAIL)),
                    cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_DOB)),
                    cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_DISTRICT)),
                    cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MOBILE))
                )
                profiles.add(profile)
            } while (cursor.moveToNext())
        }
        cursor.close()
        return profiles
    }

    fun updateProfile(profile: UserProfile): Int {
        val db = this.writableDatabase
        val values = ContentValues()
        values.put(COLUMN_NAME, profile.name)
        values.put(COLUMN_EMAIL, profile.email)
        values.put(COLUMN_DOB, profile.dob)
        values.put(COLUMN_DISTRICT, profile.district)
        values.put(COLUMN_MOBILE, profile.mobile)
        return db.update(TABLE_NAME, values, "$COLUMN_ID = ?", arrayOf(profile.id.toString()))
    }

    fun deleteProfile(id: Int): Int {
        val db = this.writableDatabase
        return db.delete(TABLE_NAME, "$COLUMN_ID = ?", arrayOf(id.toString()))
    }
}
