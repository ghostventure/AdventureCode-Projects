import SwiftUI

struct DashboardView: View {
    let session: UserSession

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    heroCard
                    metricsGrid
                    actionQueue
                    recentBookings
                }
                .padding(20)
            }
            .navigationTitle(session.role == .host ? "Host Ops" : "Performer Hub")
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(session.displayName)
                .font(.title2.weight(.bold))
                .foregroundStyle(.white)
            Text("\(session.city), \(session.state)")
                .foregroundStyle(Color.cltchMuted)
            Text("Profile completion: \(session.completionPercent)%")
                .font(.headline)
                .foregroundStyle(Color.cltchAccent)
            Text(session.role == .host ? "Native host shell mirrors the live CLTCH queue, booking, and support concepts." : "Native performer shell mirrors radar, matched gigs, booking progress, and support concepts.")
                .font(.subheadline)
                .foregroundStyle(Color.cltchMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            LinearGradient(
                colors: [Color.cltchSurface, Color.cltchSurface.opacity(0.65)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    }

    private var metricsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
            ForEach(session.metrics) { metric in
                MetricCard(title: metric.title, value: metric.value, accent: metric.accentColor)
            }
        }
    }

    private var actionQueue: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(session.role == .host ? "Host Queue Priorities" : "Performer Next Moves")
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(session.spotlightActions) { action in
                VStack(alignment: .leading, spacing: 8) {
                    Text(action.title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                    Text(action.detail)
                        .font(.subheadline)
                        .foregroundStyle(Color.cltchMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(16)
                .background(Color.cltchSurface.opacity(0.95))
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            }
        }
    }

    private var recentBookings: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(session.role == .host ? "Active Bookings" : "Upcoming Commitments")
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(session.upcomingBookings.prefix(2)) { booking in
                BookingRow(booking: booking)
            }
        }
    }
}

private struct MetricCard: View {
    let title: String
    let value: String
    let accent: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.caption.weight(.bold))
                .foregroundStyle(Color.cltchMuted)
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
            Capsule()
                .fill(accent.opacity(0.9))
                .frame(width: 40, height: 6)
        }
        .frame(maxWidth: .infinity, minHeight: 120, alignment: .leading)
        .padding(16)
        .background(Color.cltchSurface.opacity(0.95))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}
