import SwiftUI

struct BookingsView: View {
    let bookings: [Booking]
    let role: UserRole
    @State private var selectedBookingID: Booking.ID?

    var body: some View {
        NavigationStack {
            List(bookings) { booking in
                Button {
                    selectedBookingID = booking.id
                } label: {
                    BookingRow(booking: booking)
                }
                .buttonStyle(.plain)
                .listRowBackground(Color.cltchBackground)
            }
            .sheet(item: selectedBooking) { booking in
                BookingDetailView(booking: booking)
            }
            .scrollContentBackground(.hidden)
            .background(Color.cltchBackground)
            .navigationTitle(role == .host ? "Gig Pipeline" : "My Bookings")
        }
    }

    private var selectedBooking: Binding<Booking?> {
        Binding<Booking?>(
            get: { bookings.first(where: { $0.id == selectedBookingID }) },
            set: { selectedBookingID = $0?.id }
        )
    }
}

struct BookingRow: View {
    let booking: Booking

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(booking.title)
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                Text(booking.payLabel)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color.cltchGold)
            }
            Text(booking.venue)
                .foregroundStyle(Color.cltchMuted)
            Text("\(booking.location) • \(booking.dateLabel)")
                .font(.subheadline)
                .foregroundStyle(Color.cltchMuted)
            Text(booking.summary)
                .font(.subheadline)
                .foregroundStyle(Color.cltchMuted)
            HStack {
                StatusPill(state: booking.state)
                Spacer()
                Text("Match \(booking.matchScore)%")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.cltchAccent)
            }
        }
        .padding(.vertical, 8)
        .listRowSeparator(.hidden)
    }
}

private struct StatusPill: View {
    let state: Booking.State

    var body: some View {
        Text(state.rawValue.capitalized)
            .font(.caption.weight(.bold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(backgroundColor)
            .clipShape(Capsule())
            .foregroundStyle(.white)
    }

    private var backgroundColor: Color {
        switch state {
        case .open:
            return .blue
        case .pending:
            return .orange
        case .accepted:
            return .green
        case .completed:
            return .gray
        case .cancelled:
            return .red
        }
    }
}

private struct BookingDetailView: View {
    let booking: Booking
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(booking.title)
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.white)
                        Text("\(booking.venue) • \(booking.location)")
                            .foregroundStyle(Color.cltchMuted)
                        HStack {
                            StatusPill(state: booking.state)
                            Text(booking.payLabel)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(Color.cltchGold)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.cltchSurface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Summary")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(booking.summary)
                            .foregroundStyle(Color.cltchMuted)
                        Text("Next action: \(booking.nextAction)")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                        Text("Counterpart: \(booking.counterpartName)")
                            .font(.subheadline)
                            .foregroundStyle(Color.cltchMuted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.cltchSurface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Timeline")
                            .font(.headline)
                            .foregroundStyle(.white)
                        ForEach(booking.timeline) { step in
                            HStack(alignment: .top, spacing: 12) {
                                Circle()
                                    .fill(step.isComplete ? Color.cltchSuccess : Color.cltchMuted.opacity(0.4))
                                    .frame(width: 12, height: 12)
                                    .padding(.top, 5)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(step.title)
                                        .font(.subheadline.weight(.bold))
                                        .foregroundStyle(.white)
                                    Text(step.detail)
                                        .font(.subheadline)
                                        .foregroundStyle(Color.cltchMuted)
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.cltchSurface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
                .padding(20)
            }
            .background(Color.cltchBackground.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}
