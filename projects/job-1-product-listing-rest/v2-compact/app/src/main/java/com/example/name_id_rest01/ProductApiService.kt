package com.example.name_id_rest01

import retrofit2.Call
import retrofit2.http.GET

interface ProductApiService {
    @GET("products")
    fun getProducts(): Call<List<Product>>
}
