package com.example.myapplication

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.ProgressBar
import android.widget.Toast
import androidx.core.view.WindowCompat

class WebAppInterface(private val mContext: Context) {
    // Функция которая будет вызываться в JS
    @JavascriptInterface
    fun showToast(toast: String) {
        Log.d("App_MainActivity", "showToast")
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }
}

class MainActivity : AppCompatActivity() {

    private lateinit var myWebView: WebView
    private lateinit var progressBar: ProgressBar

    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        setContentView(R.layout.activity_main)


        Log.d("App_MainActivity", "CREATE")
        WindowCompat.setDecorFitsSystemWindows(window, false) // Для прозрачного taskbar

        myWebView = findViewById(R.id.webview)
        progressBar = findViewById(R.id.progressBar);


        // Взаимодействие с JavaScript
        myWebView.addJavascriptInterface(WebAppInterface(this), "Android")
        myWebView.settings.javaScriptEnabled = true


        if (isNetworkAvailable()) {
            WebView.setWebContentsDebuggingEnabled(true);
            myWebView.webViewClient = WebViewClient()
            myWebView.webChromeClient = WebChromeClient()
            myWebView.loadUrl("https://iamdennshi.github.io/manel/")


        } else {
            val intent = Intent(this, NoInternetActivity::class.java);
            startActivity(intent)
        }

    }
    private fun isNetworkAvailable(): Boolean {
        Log.d("App_MainActivity", "isNetworkAvailable")
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetworkInfo = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
        return activeNetworkInfo != null
    }

    // Для отображения Progress Bar во время загрузки webview
    private inner class WebViewClient : android.webkit.WebViewClient() {
        // Load the URL
        override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
            Log.d("App_MainActivity", "shouldOverrideUrlLoading")
            view.loadUrl(url)
            return false
        }

        // Скрываем progress bar
        override fun onPageFinished(view: WebView, url: String) {
            Log.d("App_MainActivity", "onPageFinished")
            super.onPageFinished(view, url)
            progressBar.visibility = View.GONE
        }
    }
}
