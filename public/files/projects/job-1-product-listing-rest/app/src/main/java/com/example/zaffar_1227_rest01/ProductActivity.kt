package com.example.zaffar_1227_rest01

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.zaffar_1227_rest01.api.RetrofitInstance
import com.example.zaffar_1227_rest01.models.Product
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProductActivity : AppCompatActivity() {

    private lateinit var rvProducts: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var llError: LinearLayout
    private lateinit var btnRetry: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product)

        rvProducts = findViewById(R.id.rvProducts)
        progressBar = findViewById(R.id.progressBar)
        llError = findViewById(R.id.llError)
        btnRetry = findViewById(R.id.btnRetry)

        rvProducts.layoutManager = LinearLayoutManager(this)

        fetchProducts()

        btnRetry.setOnClickListener {
            fetchProducts()
        }
    }

    private fun fetchProducts() {
        showLoading()
        RetrofitInstance.api.getProducts().enqueue(object : Callback<List<Product>> {
            override fun onResponse(call: Call<List<Product>>, response: Response<List<Product>>) {
                if (response.isSuccessful) {
                    val products = response.body() ?: emptyList()
                    rvProducts.adapter = ProductAdapter(products)
                    showContent()
                } else {
                    showError()
                }
            }

            override fun onFailure(call: Call<List<Product>>, t: Throwable) {
                showError()
            }
        })
    }

    private fun showLoading() {
        progressBar.visibility = View.VISIBLE
        rvProducts.visibility = View.GONE
        llError.visibility = View.GONE
    }

    private fun showContent() {
        progressBar.visibility = View.GONE
        rvProducts.visibility = View.VISIBLE
        llError.visibility = View.GONE
    }

    private fun showError() {
        progressBar.visibility = View.GONE
        rvProducts.visibility = View.GONE
        llError.visibility = View.VISIBLE
    }
}
