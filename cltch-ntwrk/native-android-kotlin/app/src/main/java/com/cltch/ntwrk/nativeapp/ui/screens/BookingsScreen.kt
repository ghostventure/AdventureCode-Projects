package com.cltch.ntwrk.nativeapp.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cltch.ntwrk.nativeapp.model.Booking
import com.cltch.ntwrk.nativeapp.model.BookingTimelineStep
import com.cltch.ntwrk.nativeapp.model.UserRole
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHAccent
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHGold
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHMuted
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHSuccess
import com.cltch.ntwrk.nativeapp.ui.theme.CLTCHSurface

@Composable
fun BookingsScreen(bookings: List<Booking>, role: UserRole) {
    var selectedBookingId by rememberSaveable { mutableStateOf<String?>(null) }
    val selectedBooking = bookings.firstOrNull { it.id == selectedBookingId }

    Column(
        modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(if (role == UserRole.HOST) "Gig Pipeline" else "My Bookings", fontWeight = FontWeight.Bold)
        bookings.forEach { booking ->
            BookingCard(booking = booking, onOpen = { selectedBookingId = booking.id })
        }

        selectedBooking?.let { booking ->
            BookingDetailCard(booking = booking)
        }
    }
}

@Composable
fun BookingCard(booking: Booking, onOpen: (() -> Unit)? = null) {
    Card(onClick = { onOpen?.invoke() }) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(booking.title, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                Text(booking.payLabel, color = CLTCHGold, fontWeight = FontWeight.Bold)
            }
            Text(booking.venue, color = CLTCHMuted)
            Text("${booking.location} • ${booking.dateLabel}", color = CLTCHMuted)
            Text(booking.summary, color = CLTCHMuted)
            Row(modifier = Modifier.fillMaxWidth()) {
                Text(booking.status, color = CLTCHAccent, fontWeight = FontWeight.SemiBold)
                Text("Match ${booking.matchScore}%", modifier = Modifier.padding(start = 16.dp))
            }
        }
    }
}

@Composable
private fun BookingDetailCard(booking: Booking) {
    Card {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("Booking Detail", fontWeight = FontWeight.Bold)
            Text("Counterpart: ${booking.counterpartName}", color = CLTCHMuted)
            Text("Next action: ${booking.nextAction}", color = CLTCHAccent)
            booking.timeline.forEachIndexed { index, step ->
                if (index > 0) HorizontalDivider()
                TimelineStep(step = step)
            }
        }
    }
}

@Composable
private fun TimelineStep(step: BookingTimelineStep) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(step.title, fontWeight = FontWeight.Bold, color = if (step.isComplete) CLTCHSuccess else CLTCHAccent)
        Text(step.detail, color = CLTCHMuted)
    }
}
