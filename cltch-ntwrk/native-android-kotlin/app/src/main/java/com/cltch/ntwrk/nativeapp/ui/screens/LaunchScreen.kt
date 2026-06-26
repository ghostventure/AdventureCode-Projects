package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHAccent
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted

@Composable
fun LaunchScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("CLTCH.NTWRK", fontSize = 32.sp, fontWeight = FontWeight.Black)
        Text("Native Android Preview", color = CLTCHMuted)
        CircularProgressIndicator(color = CLTCHAccent)
    }
}
