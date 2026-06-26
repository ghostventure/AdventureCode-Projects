import SwiftUI

struct RadarView: View {
    let session: UserSession

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    introCard

                    ForEach(session.radarMatches) { booking in
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(alignment: .top) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(booking.title)
                                        .font(.headline)
                                        .foregroundStyle(.white)
                                    Text("\(booking.venue) • \(booking.city)")
                                        .foregroundStyle(Color.cltchMuted)
                                }
                                Spacer()
                                Text(booking.payLabel)
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(Color.cltchGold)
                            }

                            Text(booking.summary)
                                .foregroundStyle(Color.cltchMuted)

                            HStack {
                                StatusPill(state: booking.state)
                                Text("\(booking.category) • Match \(booking.matchScore)%")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Color.cltchAccent)
                            }

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(booking.tags, id: \.self) { tag in
                                        Text(tag)
                                            .font(.caption.weight(.semibold))
                                            .padding(.horizontal, 10)
                                            .padding(.vertical, 6)
                                            .background(Color.cltchBackground.opacity(0.75))
                                            .clipShape(Capsule())
                                            .foregroundStyle(.white)
                                    }
                                }
                            }

                            Text("Next action: \(booking.nextAction)")
                                .font(.footnote.weight(.semibold))
                                .foregroundStyle(.white)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(18)
                        .background(Color.cltchSurface.opacity(0.95))
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }
                }
                .padding(20)
            }
            .navigationTitle(session.role == .host ? "Host Queue" : "Gig Radar")
        }
    }

    private var introCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(session.role == .host ? "Live queue priorities" : "Best-match radar")
                .font(.headline)
                .foregroundStyle(.white)
            Text(session.role == .host ? "This native queue mirrors the web app's idea of urgent replacements, open gigs, and category-specific booking flow." : "This native radar mirrors the web app's best-match, urgent, and saved-gig concepts for performers.")
                .foregroundStyle(Color.cltchMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Color.cltchSurface.opacity(0.95))
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    }
}

