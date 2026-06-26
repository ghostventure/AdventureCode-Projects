package com.cltch.ntwrk.nativeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cltch.ntwrk.nativeapp.ui.CLTCHApp
import com.cltch.ntwrk.nativeapp.ui.CLTCHViewModel
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CLTCHTheme {
                val viewModel: CLTCHViewModel = viewModel()
                CLTCHApp(viewModel = viewModel)
            }
        }
    }
}
