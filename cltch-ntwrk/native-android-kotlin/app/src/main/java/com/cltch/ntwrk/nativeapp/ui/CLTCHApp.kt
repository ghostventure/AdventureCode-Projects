package com.cltch.ntwrk.nativeapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.cltch.ntwrk.nativeapp.ui.screens.AuthScreen
import com.cltch.ntwrk.nativeapp.ui.screens.BookingsScreen
import com.cltch.ntwrk.nativeapp.ui.screens.DashboardScreen
import com.cltch.ntwrk.nativeapp.ui.screens.LaunchScreen
import com.cltch.ntwrk.nativeapp.ui.screens.ProfileScreen
import com.cltch.ntwrk.nativeapp.ui.screens.RadarScreen
import com.cltch.ntwrk.nativeapp.ui.screens.SupportScreen
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHBackground

@Composable
fun CLTCHApp(viewModel: CLTCHViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val message by viewModel.message.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(message) {
        if (!message.isNullOrBlank()) {
            snackbarHostState.showSnackbar(message!!)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CLTCHBackground)
    ) {
        when (val state = uiState) {
            CLTCHUiState.Launching -> LaunchScreen()
            CLTCHUiState.SignedOut -> AuthScreen(onSignIn = viewModel::signIn)
            is CLTCHUiState.SignedIn -> SignedInShell(
                sessionState = state,
                onSignOut = viewModel::signOut,
                snackbarHostState = snackbarHostState
            )
        }
    }
}

@Composable
private fun SignedInShell(
    sessionState: CLTCHUiState.SignedIn,
    onSignOut: () -> Unit,
    snackbarHostState: SnackbarHostState
) {
    val session = sessionState.session
    var selectedTab by rememberSaveable { mutableStateOf(SignedInTab.DASHBOARD) }
    Scaffold(
        containerColor = Color.Transparent,
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        bottomBar = {
            NavigationBar {
                SignedInTab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        label = { Text(tab.label(session.role.label)) },
                        icon = {}
                    )
                }
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                SignedInTab.DASHBOARD -> DashboardScreen(session = session)
                SignedInTab.RADAR -> RadarScreen(session = session)
                SignedInTab.BOOKINGS -> BookingsScreen(bookings = session.bookings, role = session.role)
                SignedInTab.PROFILE -> ProfileScreen(session = session, onSignOut = onSignOut)
                SignedInTab.SUPPORT -> SupportScreen(session = session)
            }
        }
    }
}

private enum class SignedInTab {
    DASHBOARD,
    RADAR,
    BOOKINGS,
    PROFILE,
    SUPPORT;

    fun label(roleLabel: String): String = when (this) {
        DASHBOARD -> "Dashboard"
        RADAR -> if (roleLabel == "Host") "Queue" else "Radar"
        BOOKINGS -> "Bookings"
        PROFILE -> "Profile"
        SUPPORT -> "Support"
    }
}
