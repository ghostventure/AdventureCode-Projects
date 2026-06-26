package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cltch.ntwrk.nativeapp.model.UserRole

@Composable
fun AuthScreen(onSignIn: (String, String, UserRole) -> Unit) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var role by rememberSaveable { mutableStateOf(UserRole.HOST) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Text("CLTCH.NTWRK")
        Text("Native Compose workspace for host ops, performer radar, bookings, and support diagnostics.")

        SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
            UserRole.entries.forEachIndexed { index, item ->
                SegmentedButton(
                    selected = role == item,
                    onClick = { role = item },
                    shape = androidx.compose.material3.SegmentedButtonDefaults.itemShape(index, UserRole.entries.size)
                ) {
                    Text(item.label)
                }
            }
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email") }
        )

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Password") }
        )

        CardSummary(
            title = "What this native pass includes",
            detail = "Role-aware dashboard metrics, a host queue or performer radar tab, booking timelines, profile facts, and support diagnostics."
        )

        Button(
            onClick = { onSignIn(email, password, role) },
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            Text("Continue")
        }
    }
}

@Composable
private fun CardSummary(title: String, detail: String) {
    androidx.compose.material3.Card {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title)
            Text(detail)
        }
    }
}
