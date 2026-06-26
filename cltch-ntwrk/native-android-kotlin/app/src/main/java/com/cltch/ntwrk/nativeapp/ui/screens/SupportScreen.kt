package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cltch.ntwrk.nativeapp.model.UserSession
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHAccent
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted

@Composable
fun SupportScreen(session: UserSession) {
    LazyColumn(
        modifier = Modifier.padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Support Diagnostics", fontWeight = FontWeight.Bold)
                    Text(
                        "A native equivalent to the web support diagnostics page, showing current role, session health, and mapped runtime concepts.",
                        color = CLTCHMuted
                    )
                }
            }
        }

        items(session.supportItems) { item ->
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(item.title, fontWeight = FontWeight.Bold)
                    Text(item.status, color = CLTCHAccent)
                    Text(item.detail, color = CLTCHMuted)
                }
            }
        }
    }
}
