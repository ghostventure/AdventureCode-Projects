package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import com.cltch.ntwrk.nativeapp.model.UserRole
import com.cltch.ntwrk.nativeapp.model.UserSession
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHAccent
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHGold
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted

@Composable
fun RadarScreen(session: UserSession) {
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
                    Text(
                        if (session.role == UserRole.HOST) "Live queue priorities" else "Best-match radar",
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        if (session.role == UserRole.HOST) {
                            "This native queue mirrors the web app's idea of urgent replacements, open gigs, and category-specific booking flow."
                        } else {
                            "This native radar mirrors the web app's best-match, urgent, and saved-gig concepts for performers."
                        },
                        color = CLTCHMuted
                    )
                }
            }
        }

        items(session.radarMatches) { booking ->
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(booking.title, fontWeight = FontWeight.Bold)
                            Text("${booking.venue} • ${booking.city}", color = CLTCHMuted)
                        }
                        Text(booking.payLabel, color = CLTCHGold, fontWeight = FontWeight.Bold)
                    }
                    Text(booking.summary, color = CLTCHMuted)
                    Text("${booking.category} • Match ${booking.matchScore}%", color = CLTCHAccent)
                    Text("Next action: ${booking.nextAction}", color = CLTCHMuted)
                    Text("Tags: ${booking.tags.joinToString()}", color = CLTCHMuted)
                }
            }
        }
    }
}

