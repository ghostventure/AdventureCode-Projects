import SwiftUI

struct AuthView: View {
    @EnvironmentObject private var appState: AppState
    @State private var email = ""
    @State private var password = ""
    @State private var selectedRole: UserRole = .host
    @State private var isWorking = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("CLTCH.NTWRK")
                            .font(.system(size: 28, weight: .heavy, design: .rounded))
                            .foregroundStyle(.white)
                        Text("A native SwiftUI workspace for host ops, performer radar, bookings, and support diagnostics.")
                            .foregroundStyle(Color.cltchMuted)
                    }

                    Picker("Role", selection: $selectedRole) {
                        ForEach(UserRole.allCases) { role in
                            Text(role.title).tag(role)
                        }
                    }
                    .pickerStyle(.segmented)

                    VStack(spacing: 14) {
                        CLTCHTextField(title: "Email", text: $email, keyboardType: .emailAddress)
                        CLTCHSecureField(title: "Password", text: $password)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("What this native pass includes")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.cltchMuted)
                        VStack(alignment: .leading, spacing: 6) {
                            Text("• role-aware dashboard metrics and next actions")
                            Text("• gig radar or host queue surface")
                            Text("• booking timelines and counterpart context")
                            Text("• profile and support diagnostics tabs")
                        }
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.9))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .background(Color.cltchSurface.opacity(0.9))
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                    Button {
                        Task {
                            isWorking = true
                            await appState.signIn(email: email, password: password, role: selectedRole)
                            isWorking = false
                        }
                    } label: {
                        HStack {
                            if isWorking {
                                ProgressView()
                                    .tint(.black)
                            }
                            Text(isWorking ? "Signing In..." : "Continue")
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(CLTCHPrimaryButtonStyle())
                    .disabled(isWorking || email.isEmpty || password.isEmpty)
                }
                .padding(24)
            }
        }
    }
}

private struct CLTCHTextField: View {
    let title: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.cltchMuted)
            TextField(title, text: $text)
                .textInputAutocapitalization(.never)
                .keyboardType(keyboardType)
                .padding()
                .background(Color.cltchSurface)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}

private struct CLTCHSecureField: View {
    let title: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.cltchMuted)
            SecureField(title, text: $text)
                .textInputAutocapitalization(.never)
                .padding()
                .background(Color.cltchSurface)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}
