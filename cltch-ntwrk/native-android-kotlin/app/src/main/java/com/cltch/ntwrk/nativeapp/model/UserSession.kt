package com.cltch.ntwrk.nativeapp.model

data class UserSession(
    val id: String,
    val email: String,
    val displayName: String,
    val role: UserRole,
    val city: String,
    val state: String,
    val completionPercent: Int,
    val status: String,
    val bookings: List<Booking>,
    val metrics: List<DashboardMetric>,
    val spotlightActions: List<WorkspaceAction>,
    val radarMatches: List<Booking>,
    val profileFacts: List<ProfileFact>,
    val supportItems: List<SupportItem>
)

data class DashboardMetric(
    val id: String,
    val title: String,
    val value: String,
    val accentKey: String
)

data class WorkspaceAction(
    val id: String,
    val title: String,
    val detail: String
)

data class ProfileFact(
    val id: String,
    val label: String,
    val value: String
)

data class SupportItem(
    val id: String,
    val title: String,
    val detail: String,
    val status: String
)
