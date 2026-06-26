package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cltch.ntwrk.nativeapp.model.DashboardMetric
import com.cltch.ntwrk.nativeapp.model.UserSession
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHAccent
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHGold
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHSurface
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHSuccess
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHWarning

@Composable
fun DashboardScreen(session: UserSession) {
    Column(
        modifier = Modifier.padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CLTCHSurface)
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(session.displayName, fontWeight = FontWeight.Bold)
                Text("${session.city}, ${session.state}", color = CLTCHMuted)
                Text("Profile completion: ${session.completionPercent}%", color = CLTCHAccent)
                Text(
                    if (session.role == com.cltch.ntwrk.nativeapp.model.UserRole.HOST) {
                        "Native host shell mirrors the live CLTCH queue, booking, and support concepts."
                    } else {
                        "Native performer shell mirrors radar, matched gigs, booking progress, and support concepts."
                    },
                    color = CLTCHMuted
                )
            }
        }

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.height(240.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            userScrollEnabled = false
        ) {
            items(session.metrics) { metric ->
                Card {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(CLTCHSurface)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(metric.title.uppercase(), color = CLTCHMuted)
                        Text(metric.value, fontWeight = FontWeight.Bold)
                        Box(
                            modifier = Modifier
                                .height(6.dp)
                                .fillMaxWidth(0.3f)
                                .background(metricAccent(metric))
                        )
                    }
                }
            }
        }

        Text(
            if (session.role == com.cltch.ntwrk.nativeapp.model.UserRole.HOST) "Host Queue Priorities" else "Performer Next Moves",
            fontWeight = FontWeight.Bold
        )
        session.spotlightActions.forEach { action ->
            Card {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(CLTCHSurface)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(action.title, fontWeight = FontWeight.Bold)
                    Text(action.detail, color = CLTCHMuted)
                }
            }
        }

        Text(
            if (session.role == com.cltch.ntwrk.nativeapp.model.UserRole.HOST) "Active Bookings" else "Upcoming Commitments",
            fontWeight = FontWeight.Bold
        )
        session.bookings.take(2).forEach { booking ->
            BookingCard(booking = booking)
        }
    }
}

private fun metricAccent(metric: DashboardMetric): Color = when (metric.accentKey) {
    "gold" -> CLTCHGold
    "green" -> CLTCHSuccess
    "orange" -> CLTCHWarning
    else -> CLTCHAccent
}
