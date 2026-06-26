package com.cltch.ntwrk.nativeapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val CLTCHColorScheme = darkColorScheme(
    primary = CLTCHGold,
    secondary = CLTCHAccent,
    background = CLTCHBackground,
    surface = CLTCHSurface
)

@Composable
fun CLTCHTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CLTCHColorScheme,
        content = content
    )
}
