package com.cltch.ntwrk.nativeapp.model

data class Booking(
    val id: String,
    val title: String,
    val venue: String,
    val location: String,
    val dateLabel: String,
    val payLabel: String,
    val status: String,
    val matchScore: Int,
    val city: String,
    val category: String,
    val summary: String,
    val tags: List<String>,
    val timeline: List<BookingTimelineStep>,
    val nextAction: String,
    val counterpartName: String
)

data class BookingTimelineStep(
    val id: String,
    val title: String,
    val detail: String,
    val isComplete: Boolean
)
