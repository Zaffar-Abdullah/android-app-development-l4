package com.example.zaffar_1227_rest01.api

import com.example.zaffar_1227_rest01.models.Product
import retrofit2.Call
import retrofit2.http.GET

interface ApiService {
    @GET("products")
    fun getProducts(): Call<List<Product>>
}
