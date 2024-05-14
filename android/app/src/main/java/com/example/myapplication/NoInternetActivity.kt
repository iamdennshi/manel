package com.example.myapplication

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.ConnectivityManager
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.Toast

class NoInternetActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_no_internet)

        var buttonUpdate : Button = findViewById(R.id.btnUpdate)
        buttonUpdate.setOnClickListener {
            Toast.makeText(applicationContext, "Обновляем ...", Toast.LENGTH_SHORT).show()
            val intent = Intent(this@NoInternetActivity, MainActivity::class.java)
            startActivity(intent)
        }

    }
//    fun onClickUpdateButton(view: View?) {
//        Toast.makeText(applicationContext, "Обновляем ...", Toast.LENGTH_SHORT).show()
//        val intent = Intent(this@NoInternetActivity, MainActivity::class.java)
//        startActivity(intent)
//    }

//    fun isNetworkAvailable(): Boolean {
//        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
//        val activeNetworkInfo = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
//        return activeNetworkInfo != null
//    }
}