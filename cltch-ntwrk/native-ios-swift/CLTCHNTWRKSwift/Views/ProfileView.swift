import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var appState: AppState
    let session: UserSession

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 10) {
                        Circle()
                            .fill(Color.cltchSurface)
                            .frame(width: 92, height: 92)
                            .overlay {
                                Text(String(session.displayName.prefix(1)))
                                    .font(.largeTitle.weight(.bold))
                                    .foregroundStyle(Color.cltchGold)
                            }
                        Text(session.displayName)
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.white)
                        Text(session.email)
                            .foregroundStyle(Color.cltchMuted)
                    }

                    VStack(spacing: 12) {
                        ForEach(session.profileFacts) { fact in
                            ProfileStatLine(label: fact.label, value: fact.value)
                        }
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text("Native parity note")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text("This Swift app now mirrors the CLTCH role-aware shell, queue/radar surfaces, booking timelines, and support diagnostics using structured native sample data. Firebase wiring is still the next separate step.")
                            .foregroundStyle(Color.cltchMuted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.cltchSurface)
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                    Button("Sign Out") {
                        Task {
                            await appState.signOut()
                        }
                    }
                    .buttonStyle(CLTCHPrimaryButtonStyle())
                }
                .padding(24)
            }
            .navigationTitle("Profile")
        }
    }
}

private struct ProfileStatLine: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(Color.cltchMuted)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
                .foregroundStyle(.white)
        }
        .padding(16)
        .background(Color.cltchSurface)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}
