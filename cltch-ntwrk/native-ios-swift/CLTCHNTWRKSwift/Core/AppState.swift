import Foundation

@MainActor
final class AppState: ObservableObject {
    enum Phase {
        case launching
        case signedOut
        case signedIn(UserSession)
    }

    @Published private(set) var phase: Phase = .launching
    @Published var bannerMessage: String?

    let sessionService: SessionService

    init(sessionService: SessionService = PreviewSessionService()) {
        self.sessionService = sessionService
    }

    func bootstrap() async {
        do {
            if let session = try await sessionService.restoreSession() {
                phase = .signedIn(session)
            } else {
                phase = .signedOut
            }
        } catch {
            bannerMessage = "Unable to restore session."
            phase = .signedOut
        }
    }

    func signIn(email: String, password: String, role: UserRole) async {
        do {
            let session = try await sessionService.signIn(email: email, password: password, preferredRole: role)
            phase = .signedIn(session)
            bannerMessage = nil
        } catch {
            bannerMessage = error.localizedDescription
        }
    }

    func signOut() async {
        do {
            try await sessionService.signOut()
        } catch {
            bannerMessage = "Sign-out did not complete cleanly."
        }
        phase = .signedOut
    }
}
