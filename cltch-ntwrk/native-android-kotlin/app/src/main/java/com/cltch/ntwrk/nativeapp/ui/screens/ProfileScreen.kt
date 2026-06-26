package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cltch.ntwrk.nativeapp.model.UserSession
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted

@Composable
fun ProfileScreen(session: UserSession, onSignOut: () -> Unit) {
    Column(
        modifier = Modifier.padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(session.displayName, fontWeight = FontWeight.Bold)
                Text(session.email, color = CLTCHMuted)
                session.profileFacts.forEach { fact ->
                    Text("${fact.label}: ${fact.value}")
                }
            }
        }

        Card {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("Native parity note", fontWeight = FontWeight.Bold)
                Text(
                    "This Kotlin app now mirrors the CLTCH role-aware shell, queue or radar surfaces, booking timelines, and support diagnostics using structured native sample data. Firebase wiring is still the next separate step.",
                    color = CLTCHMuted
                )
            }
        }

        Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) {
            Text("Sign Out")
        }
    }
}
