import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        ZStack {
            Color.cltchBackground
                .ignoresSafeArea()

            switch appState.phase {
            case .launching:
                LaunchView()
            case .signedOut:
                AuthView()
            case .signedIn(let session):
                MainTabView(session: session)
            }
        }
        .overlay(alignment: .top) {
            if let bannerMessage = appState.bannerMessage {
                Text(bannerMessage)
                    .font(.footnote.weight(.semibold))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(Color.red.opacity(0.85))
                    .clipShape(Capsule())
                    .padding(.top, 16)
            }
        }
        .preferredColorScheme(.dark)
    }
}

private struct MainTabView: View {
    let session: UserSession

    var body: some View {
        TabView {
            DashboardView(session: session)
                .tabItem {
                    Label("Dashboard", systemImage: "rectangle.grid.2x2.fill")
                }

            RadarView(session: session)
                .tabItem {
                    Label(session.role == .host ? "Queue" : "Radar", systemImage: "dot.radiowaves.left.and.right")
                }

            BookingsView(bookings: session.upcomingBookings, role: session.role)
                .tabItem {
                    Label("Bookings", systemImage: "calendar")
                }

            ProfileView(session: session)
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle")
                }

            SupportView(session: session)
                .tabItem {
                    Label("Support", systemImage: "lifepreserver")
                }
        }
        .tint(.cltchAccent)
    }
}

private struct LaunchView: View {
    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("CLTCH.NTWRK")
                .font(.system(size: 34, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)
                .tracking(2)
            Text("Native iOS Preview")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Color.cltchMuted)
            ProgressView()
                .tint(.cltchAccent)
                .padding(.top, 8)
            Spacer()
        }
        .padding(24)
    }
}
