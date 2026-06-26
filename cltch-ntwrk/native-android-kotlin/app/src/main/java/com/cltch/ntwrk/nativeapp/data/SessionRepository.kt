package com.cltch.ntwrk.nativeapp.data

import com.cltch.ntwrk.nativeapp.model.Booking
import com.cltch.ntwrk.nativeapp.model.BookingTimelineStep
import com.cltch.ntwrk.nativeapp.model.DashboardMetric
import com.cltch.ntwrk.nativeapp.model.ProfileFact
import com.cltch.ntwrk.nativeapp.model.SupportItem
import com.cltch.ntwrk.nativeapp.model.UserRole
import com.cltch.ntwrk.nativeapp.model.UserSession
import com.cltch.ntwrk.nativeapp.model.WorkspaceAction
import kotlinx.coroutines.delay
import java.util.UUID

class SessionRepository {
    private var cachedSession: UserSession? = null

    suspend fun restore(): UserSession? {
        delay(900)
        return cachedSession
    }

    suspend fun signIn(email: String, password: String, role: UserRole): UserSession {
        delay(700)
        val session = sampleSession(email, role)
        cachedSession = session
        return session
    }

    suspend fun signOut() {
        delay(250)
        cachedSession = null
    }

    private fun sampleSession(email: String, role: UserRole): UserSession {
        return if (role == UserRole.HOST) {
            UserSession(
                id = UUID.randomUUID().toString(),
                email = email,
                displayName = "North Loop Events",
                role = UserRole.HOST,
                city = "Atlanta",
                state = "GA",
                completionPercent = 92,
                status = "Verified host",
                bookings = sampleBookings(role),
                metrics = listOf(
                    DashboardMetric("host-open", "Open Gigs", "12", "accent"),
                    DashboardMetric("host-booked", "Booked", "4", "green"),
                    DashboardMetric("host-response", "Avg Response", "14m", "gold"),
                    DashboardMetric("host-reviews", "Pending Reviews", "2", "orange")
                ),
                spotlightActions = listOf(
                    WorkspaceAction("host-action-1", "Re-open Friday Rooftop Set", "One accepted performer dropped. Re-open the posting and push it back to the live pool."),
                    WorkspaceAction("host-action-2", "Review Sunday Brunch applicants", "Three strong matches are waiting in the booking queue with high fit scores."),
                    WorkspaceAction("host-action-3", "Finish payout profile", "Your host payout setup is nearly complete. One banking confirmation item remains.")
                ),
                radarMatches = hostRadarMatches(),
                profileFacts = listOf(
                    ProfileFact("host-fact-1", "Role", "Host"),
                    ProfileFact("host-fact-2", "Verification", "Verified"),
                    ProfileFact("host-fact-3", "Company", "North Loop Events"),
                    ProfileFact("host-fact-4", "Primary Market", "Atlanta, GA"),
                    ProfileFact("host-fact-5", "Profile Completion", "92%"),
                    ProfileFact("host-fact-6", "Preferred Payout", "Apple Pay / bank transfer")
                ),
                supportItems = listOf(
                    SupportItem("host-support-1", "Auth State", "Signed in with a verified host role and an active local session.", "Healthy"),
                    SupportItem("host-support-2", "Profile Draft Recovery", "Draft recovery is available for host post and profile forms in the web contract.", "Ready"),
                    SupportItem("host-support-3", "Booking Diagnostics", "Open, booked, review, and cancelled queue concepts are mapped into the native shell.", "Mapped")
                )
            )
        } else {
            UserSession(
                id = UUID.randomUUID().toString(),
                email = email,
                displayName = "DJ Meridian",
                role = UserRole.MUSICIAN,
                city = "Charlotte",
                state = "NC",
                completionPercent = 88,
                status = "Performer ready",
                bookings = sampleBookings(role),
                metrics = listOf(
                    DashboardMetric("musician-matches", "Matched Gigs", "8", "accent"),
                    DashboardMetric("musician-accepted", "Accepted", "3", "green"),
                    DashboardMetric("musician-tier", "Tier", "Rising Star", "gold"),
                    DashboardMetric("musician-rating", "Recent Score", "4.9", "orange")
                ),
                spotlightActions = listOf(
                    WorkspaceAction("musician-action-1", "Review Gig Radar", "Two urgent Atlanta matches are high-pay and time-sensitive right now."),
                    WorkspaceAction("musician-action-2", "Confirm Friday hotel lounge check-in", "Your accepted booking has a pre-event check-in and message thread step due next."),
                    WorkspaceAction("musician-action-3", "Complete payout profile", "Add your final payout preference to unlock faster settlement after completed gigs.")
                ),
                radarMatches = musicianRadarMatches(),
                profileFacts = listOf(
                    ProfileFact("musician-fact-1", "Role", "Musician / DJ"),
                    ProfileFact("musician-fact-2", "Tier", "Rising Star"),
                    ProfileFact("musician-fact-3", "Primary Market", "Charlotte, NC"),
                    ProfileFact("musician-fact-4", "Profile Completion", "88%"),
                    ProfileFact("musician-fact-5", "Categories", "DJ, Musician"),
                    ProfileFact("musician-fact-6", "Availability", "Weekend evenings")
                ),
                supportItems = listOf(
                    SupportItem("musician-support-1", "Auth State", "Signed in with a performer role and an active local session.", "Healthy"),
                    SupportItem("musician-support-2", "Gig Radar", "Saved, urgent, and best-match concepts are represented in the native shell.", "Ready"),
                    SupportItem("musician-support-3", "Profile Draft Recovery", "Draft and unsaved-change concepts from the live site are modeled for future native forms.", "Planned")
                )
            )
        }
    }

    private fun sampleBookings(role: UserRole): List<Booking> {
        return if (role == UserRole.HOST) {
            listOf(
                Booking(
                    id = "host-1",
                    title = "Friday Rooftop Set",
                    venue = "Skyline Social",
                    location = "Atlanta, GA",
                    dateLabel = "Apr 12, 8:00 PM",
                    payLabel = "$850",
                    status = "Pending",
                    matchScore = 94,
                    city = "Atlanta",
                    category = "DJ",
                    summary = "High-energy rooftop event with one lead match waiting on host confirmation.",
                    tags = listOf("urgent", "dj", "high match"),
                    timeline = listOf(
                        BookingTimelineStep("host-1-step-1", "Gig posted", "The event is live in the queue.", true),
                        BookingTimelineStep("host-1-step-2", "Match shortlisted", "Top performer identified at 94% fit.", true),
                        BookingTimelineStep("host-1-step-3", "Host confirmation", "Confirm or reopen before the backup candidates expire.", false)
                    ),
                    nextAction = "Review top candidate",
                    counterpartName = "DJ Meridian"
                ),
                Booking(
                    id = "host-2",
                    title = "Sunday Brunch Jazz",
                    venue = "South Market",
                    location = "Atlanta, GA",
                    dateLabel = "Apr 14, 11:30 AM",
                    payLabel = "$600",
                    status = "Open",
                    matchScore = 88,
                    city = "Atlanta",
                    category = "Musician",
                    summary = "Open brunch slot with strong acoustic-fit candidates still flowing into the queue.",
                    tags = listOf("brunch", "jazz", "open"),
                    timeline = listOf(
                        BookingTimelineStep("host-2-step-1", "Gig posted", "The brunch set is live.", true),
                        BookingTimelineStep("host-2-step-2", "Awaiting acceptances", "Review new candidates as they land.", false),
                        BookingTimelineStep("host-2-step-3", "Finalize booking", "Confirm performer and payment details.", false)
                    ),
                    nextAction = "Check fresh applicants",
                    counterpartName = "Open queue"
                )
            )
        } else {
            listOf(
                Booking(
                    id = "musician-1",
                    title = "Hotel Lounge Residency",
                    venue = "Westline Hotel",
                    location = "Charlotte, NC",
                    dateLabel = "Apr 11, 7:00 PM",
                    payLabel = "$500",
                    status = "Accepted",
                    matchScore = 97,
                    city = "Charlotte",
                    category = "Musician",
                    summary = "Accepted lounge residency with host notes, pre-event message thread, and check-in timing.",
                    tags = listOf("accepted", "residency", "lounge"),
                    timeline = listOf(
                        BookingTimelineStep("musician-1-step-1", "Accepted", "Host confirmed the booking.", true),
                        BookingTimelineStep("musician-1-step-2", "Pre-event check-in", "Confirm arrival window and set list.", false),
                        BookingTimelineStep("musician-1-step-3", "Post-event review", "Review unlocks tier progression.", false)
                    ),
                    nextAction = "Send pre-event check-in",
                    counterpartName = "Westline Hotel"
                ),
                Booking(
                    id = "musician-2",
                    title = "Private Event DJ",
                    venue = "Mint House",
                    location = "Charlotte, NC",
                    dateLabel = "Apr 20, 9:00 PM",
                    payLabel = "$900",
                    status = "Pending",
                    matchScore = 91,
                    city = "Charlotte",
                    category = "DJ",
                    summary = "High-pay DJ match still waiting on final confirmation from the host queue.",
                    tags = listOf("dj", "private event", "pending"),
                    timeline = listOf(
                        BookingTimelineStep("musician-2-step-1", "Applied", "Application reached the host queue.", true),
                        BookingTimelineStep("musician-2-step-2", "Shortlisted", "You are currently a lead match.", true),
                        BookingTimelineStep("musician-2-step-3", "Host confirmation", "Watch the queue for a final decision.", false)
                    ),
                    nextAction = "Monitor host queue",
                    counterpartName = "Mint House"
                )
            )
        }
    }

    private fun hostRadarMatches(): List<Booking> = listOf(
        Booking(
            id = "host-radar-1",
            title = "Urgent Replacement DJ",
            venue = "River Deck",
            location = "Atlanta, GA",
            dateLabel = "Apr 9, 10:00 PM",
            payLabel = "$1,100",
            status = "Open",
            matchScore = 96,
            city = "Atlanta",
            category = "DJ",
            summary = "A late drop created an urgent same-week replacement need with a strong existing candidate set.",
            tags = listOf("urgent", "dj", "same week"),
            timeline = emptyList(),
            nextAction = "Repost to priority pool",
            counterpartName = "Priority candidates"
        ),
        Booking(
            id = "host-radar-2",
            title = "Fashion Recap Shooter",
            venue = "Warehouse District",
            location = "Atlanta, GA",
            dateLabel = "Apr 18, 6:30 PM",
            payLabel = "$700",
            status = "Open",
            matchScore = 89,
            city = "Atlanta",
            category = "Cinematographer",
            summary = "Visual-content role showing CLTCH's broader performer categories beyond music-only bookings.",
            tags = listOf("cinematographer", "content", "open"),
            timeline = emptyList(),
            nextAction = "Review top reel",
            counterpartName = "Visual queue"
        )
    )

    private fun musicianRadarMatches(): List<Booking> = listOf(
        Booking(
            id = "musician-radar-1",
            title = "Skyline Friday DJ Set",
            venue = "Skyline Social",
            location = "Atlanta, GA",
            dateLabel = "Apr 12, 8:00 PM",
            payLabel = "$850",
            status = "Pending",
            matchScore = 94,
            city = "Atlanta",
            category = "DJ",
            summary = "Best-match radar card with strong pay, city fit, and category alignment.",
            tags = listOf("best match", "dj", "atlanta"),
            timeline = emptyList(),
            nextAction = "Stay available",
            counterpartName = "North Loop Events"
        ),
        Booking(
            id = "musician-radar-2",
            title = "Sunday Patio Brunch",
            venue = "South Market",
            location = "Atlanta, GA",
            dateLabel = "Apr 14, 11:30 AM",
            payLabel = "$600",
            status = "Open",
            matchScore = 88,
            city = "Atlanta",
            category = "Musician",
            summary = "Strong live-jazz fit with a lower pay band but a solid host-review upside.",
            tags = listOf("brunch", "musician", "good fit"),
            timeline = emptyList(),
            nextAction = "Apply now",
            counterpartName = "South Market"
        )
    )
}
