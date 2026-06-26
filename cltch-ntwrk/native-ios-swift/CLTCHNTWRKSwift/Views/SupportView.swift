import SwiftUI

struct SupportView: View {
    let session: UserSession

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Support Diagnostics")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(.white)
                        Text("A native equivalent to the web support diagnostics page, showing the current role, session health, and mapped runtime concepts.")
                            .foregroundStyle(Color.cltchMuted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.cltchSurface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                    ForEach(session.supportItems) { item in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(item.title)
                                    .font(.headline)
                                    .foregroundStyle(.white)
                                Spacer()
                                Text(item.status)
                                    .font(.caption.weight(.bold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.cltchBackground.opacity(0.75))
                                    .clipShape(Capsule())
                                    .foregroundStyle(Color.cltchAccent)
                            }
                            Text(item.detail)
                                .foregroundStyle(Color.cltchMuted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(18)
                        .background(Color.cltchSurface.opacity(0.95))
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }
                }
                .padding(20)
            }
            .navigationTitle("Support")
        }
    }
}
