import Foundation

protocol SessionService {
    func restoreSession() async throws -> UserSession?
    func signIn(email: String, password: String, preferredRole: UserRole) async throws -> UserSession
    func signOut() async throws
}

final class PreviewSessionService: SessionService {
    private var session: UserSession?

    func restoreSession() async throws -> UserSession? {
        try await Task.sleep(for: .milliseconds(900))
        return session
    }

    func signIn(email: String, password: String, preferredRole: UserRole) async throws -> UserSession {
        try await Task.sleep(for: .milliseconds(700))
        let session = SampleData.session(email: email, role: preferredRole)
        self.session = session
        return session
    }

    func signOut() async throws {
        try await Task.sleep(for: .milliseconds(250))
        session = nil
    }
}

enum SampleData {
    static func session(email: String, role: UserRole) -> UserSession {
        switch role {
        case .host:
            return UserSession(
                id: UUID().uuidString,
                email: email,
                displayName: "North Loop Events",
                role: .host,
                city: "Atlanta",
                state: "GA",
                completionPercent: 92,
                status: "Verified host",
                upcomingBookings: bookings(for: .host),
                metrics: [
                    DashboardMetric(id: "host-open", title: "Open Gigs", value: "12", accentKey: "accent"),
                    DashboardMetric(id: "host-booked", title: "Booked", value: "4", accentKey: "green"),
                    DashboardMetric(id: "host-response", title: "Avg Response", value: "14m", accentKey: "gold"),
                    DashboardMetric(id: "host-reviews", title: "Pending Reviews", value: "2", accentKey: "orange")
                ],
                spotlightActions: [
                    WorkspaceAction(id: "host-action-1", title: "Re-open Friday Rooftop Set", detail: "One accepted performer dropped. Re-open the posting and push it back to the live pool."),
                    WorkspaceAction(id: "host-action-2", title: "Review Sunday Brunch applicants", detail: "Three strong matches are waiting in the booking queue with high fit scores."),
                    WorkspaceAction(id: "host-action-3", title: "Finish payout profile", detail: "Your host payout setup is nearly complete. One banking confirmation item remains.")
                ],
                radarMatches: hostRadarMatches(),
                profileFacts: [
                    ProfileFact(id: "host-fact-1", label: "Role", value: "Host"),
                    ProfileFact(id: "host-fact-2", label: "Verification", value: "Verified"),
                    ProfileFact(id: "host-fact-3", label: "Company", value: "North Loop Events"),
                    ProfileFact(id: "host-fact-4", label: "Primary Market", value: "Atlanta, GA"),
                    ProfileFact(id: "host-fact-5", label: "Profile Completion", value: "92%"),
                    ProfileFact(id: "host-fact-6", label: "Preferred Payout", value: "Apple Pay / bank transfer")
                ],
                supportItems: [
                    SupportItem(id: "host-support-1", title: "Auth State", detail: "Signed in with a verified host role and an active local session.", status: "Healthy"),
                    SupportItem(id: "host-support-2", title: "Profile Draft Recovery", detail: "Draft recovery is available for host post and profile forms in the web contract.", status: "Ready"),
                    SupportItem(id: "host-support-3", title: "Booking Diagnostics", detail: "Open, booked, review, and cancelled queue concepts are mapped into the native shell.", status: "Mapped")
                ]
            )
        case .musician:
            return UserSession(
                id: UUID().uuidString,
                email: email,
                displayName: "DJ Meridian",
                role: .musician,
                city: "Charlotte",
                state: "NC",
                completionPercent: 88,
                status: "Performer ready",
                upcomingBookings: bookings(for: .musician),
                metrics: [
                    DashboardMetric(id: "musician-matches", title: "Matched Gigs", value: "8", accentKey: "accent"),
                    DashboardMetric(id: "musician-accepted", title: "Accepted", value: "3", accentKey: "green"),
                    DashboardMetric(id: "musician-tier", title: "Tier", value: "Rising Star", accentKey: "gold"),
                    DashboardMetric(id: "musician-rating", title: "Recent Score", value: "4.9", accentKey: "orange")
                ],
                spotlightActions: [
                    WorkspaceAction(id: "musician-action-1", title: "Review Gig Radar", detail: "Two urgent Atlanta matches are high-pay and time-sensitive right now."),
                    WorkspaceAction(id: "musician-action-2", title: "Confirm Friday hotel lounge check-in", detail: "Your accepted booking has a pre-event check-in and message thread step due next."),
                    WorkspaceAction(id: "musician-action-3", title: "Complete payout profile", detail: "Add your final payout preference to unlock faster settlement after completed gigs.")
                ],
                radarMatches: musicianRadarMatches(),
                profileFacts: [
                    ProfileFact(id: "musician-fact-1", label: "Role", value: "Musician / DJ"),
                    ProfileFact(id: "musician-fact-2", label: "Tier", value: "Rising Star"),
                    ProfileFact(id: "musician-fact-3", label: "Primary Market", value: "Charlotte, NC"),
                    ProfileFact(id: "musician-fact-4", label: "Profile Completion", value: "88%"),
                    ProfileFact(id: "musician-fact-5", label: "Categories", value: "DJ, Musician"),
                    ProfileFact(id: "musician-fact-6", label: "Availability", value: "Weekend evenings")
                ],
                supportItems: [
                    SupportItem(id: "musician-support-1", title: "Auth State", detail: "Signed in with a performer role and an active local session.", status: "Healthy"),
                    SupportItem(id: "musician-support-2", title: "Gig Radar", detail: "Saved, urgent, and best-match concepts are represented in the native shell.", status: "Ready"),
                    SupportItem(id: "musician-support-3", title: "Profile Draft Recovery", detail: "Draft and unsaved-change concepts from the live site are modeled for future native forms.", status: "Planned")
                ]
            )
        }
    }

    static func bookings(for role: UserRole) -> [Booking] {
        switch role {
        case .host:
            return [
                Booking(
                    id: "host-1",
                    title: "Friday Rooftop Set",
                    venue: "Skyline Social",
                    location: "Atlanta, GA",
                    dateLabel: "Apr 12, 8:00 PM",
                    payLabel: "$850",
                    state: .pending,
                    matchScore: 94,
                    city: "Atlanta",
                    category: "DJ",
                    summary: "High-energy rooftop event with one lead match waiting on host confirmation.",
                    tags: ["urgent", "dj", "high match"],
                    timeline: [
                        BookingTimelineStep(id: "host-1-step-1", title: "Gig posted", detail: "The event is live in the queue.", isComplete: true),
                        BookingTimelineStep(id: "host-1-step-2", title: "Match shortlisted", detail: "Top performer identified at 94% fit.", isComplete: true),
                        BookingTimelineStep(id: "host-1-step-3", title: "Host confirmation", detail: "Confirm or reopen before the backup candidates expire.", isComplete: false)
                    ],
                    nextAction: "Review top candidate",
                    counterpartName: "DJ Meridian"
                ),
                Booking(
                    id: "host-2",
                    title: "Sunday Brunch Jazz",
                    venue: "South Market",
                    location: "Atlanta, GA",
                    dateLabel: "Apr 14, 11:30 AM",
                    payLabel: "$600",
                    state: .open,
                    matchScore: 88,
                    city: "Atlanta",
                    category: "Musician",
                    summary: "Open brunch slot with strong acoustic-fit candidates still flowing into the queue.",
                    tags: ["brunch", "jazz", "open"],
                    timeline: [
                        BookingTimelineStep(id: "host-2-step-1", title: "Gig posted", detail: "The brunch set is live.", isComplete: true),
                        BookingTimelineStep(id: "host-2-step-2", title: "Awaiting acceptances", detail: "Review new candidates as they land.", isComplete: false),
                        BookingTimelineStep(id: "host-2-step-3", title: "Finalize booking", detail: "Confirm performer and payment details.", isComplete: false)
                    ],
                    nextAction: "Check fresh applicants",
                    counterpartName: "Open queue"
                )
            ]
        case .musician:
            return [
                Booking(
                    id: "musician-1",
                    title: "Hotel Lounge Residency",
                    venue: "Westline Hotel",
                    location: "Charlotte, NC",
                    dateLabel: "Apr 11, 7:00 PM",
                    payLabel: "$500",
                    state: .accepted,
                    matchScore: 97,
                    city: "Charlotte",
                    category: "Musician",
                    summary: "Accepted lounge residency with host notes, pre-event message thread, and check-in timing.",
                    tags: ["accepted", "residency", "lounge"],
                    timeline: [
                        BookingTimelineStep(id: "musician-1-step-1", title: "Accepted", detail: "Host confirmed the booking.", isComplete: true),
                        BookingTimelineStep(id: "musician-1-step-2", title: "Pre-event check-in", detail: "Confirm arrival window and set list.", isComplete: false),
                        BookingTimelineStep(id: "musician-1-step-3", title: "Post-event review", detail: "Review unlocks tier progression.", isComplete: false)
                    ],
                    nextAction: "Send pre-event check-in",
                    counterpartName: "Westline Hotel"
                ),
                Booking(
                    id: "musician-2",
                    title: "Private Event DJ",
                    venue: "Mint House",
                    location: "Charlotte, NC",
                    dateLabel: "Apr 20, 9:00 PM",
                    payLabel: "$900",
                    state: .pending,
                    matchScore: 91,
                    city: "Charlotte",
                    category: "DJ",
                    summary: "High-pay DJ match still waiting on final confirmation from the host queue.",
                    tags: ["dj", "private event", "pending"],
                    timeline: [
                        BookingTimelineStep(id: "musician-2-step-1", title: "Applied", detail: "Application reached the host queue.", isComplete: true),
                        BookingTimelineStep(id: "musician-2-step-2", title: "Shortlisted", detail: "You are currently a lead match.", isComplete: true),
                        BookingTimelineStep(id: "musician-2-step-3", title: "Host confirmation", detail: "Watch the queue for a final decision.", isComplete: false)
                    ],
                    nextAction: "Monitor host queue",
                    counterpartName: "Mint House"
                )
            ]
        }
    }

    static func hostRadarMatches() -> [Booking] {
        [
            Booking(
                id: "host-radar-1",
                title: "Urgent Replacement DJ",
                venue: "River Deck",
                location: "Atlanta, GA",
                dateLabel: "Apr 9, 10:00 PM",
                payLabel: "$1,100",
                state: .open,
                matchScore: 96,
                city: "Atlanta",
                category: "DJ",
                summary: "A late drop created an urgent same-week replacement need with a strong existing candidate set.",
                tags: ["urgent", "dj", "same week"],
                timeline: [],
                nextAction: "Repost to priority pool",
                counterpartName: "Priority candidates"
            ),
            Booking(
                id: "host-radar-2",
                title: "Fashion Recap Shooter",
                venue: "Warehouse District",
                location: "Atlanta, GA",
                dateLabel: "Apr 18, 6:30 PM",
                payLabel: "$700",
                state: .open,
                matchScore: 89,
                city: "Atlanta",
                category: "Cinematographer",
                summary: "Visual-content role showing CLTCH's broader performer categories beyond music-only bookings.",
                tags: ["cinematographer", "content", "open"],
                timeline: [],
                nextAction: "Review top reel",
                counterpartName: "Visual queue"
            )
        ]
    }

    static func musicianRadarMatches() -> [Booking] {
        [
            Booking(
                id: "musician-radar-1",
                title: "Skyline Friday DJ Set",
                venue: "Skyline Social",
                location: "Atlanta, GA",
                dateLabel: "Apr 12, 8:00 PM",
                payLabel: "$850",
                state: .pending,
                matchScore: 94,
                city: "Atlanta",
                category: "DJ",
                summary: "Best-match radar card with strong pay, city fit, and category alignment.",
                tags: ["best match", "dj", "atlanta"],
                timeline: [],
                nextAction: "Stay available",
                counterpartName: "North Loop Events"
            ),
            Booking(
                id: "musician-radar-2",
                title: "Sunday Patio Brunch",
                venue: "South Market",
                location: "Atlanta, GA",
                dateLabel: "Apr 14, 11:30 AM",
                payLabel: "$600",
                state: .open,
                matchScore: 88,
                city: "Atlanta",
                category: "Musician",
                summary: "Strong live-jazz fit with a lower pay band but a solid host-review upside.",
                tags: ["brunch", "musician", "good fit"],
                timeline: [],
                nextAction: "Apply now",
                counterpartName: "South Market"
            )
        ]
    }
}
