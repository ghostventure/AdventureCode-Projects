import SwiftUI

extension Color {
    static let cltchBackground = Color(red: 10 / 255, green: 15 / 255, blue: 24 / 255)
    static let cltchSurface = Color(red: 19 / 255, green: 31 / 255, blue: 49 / 255)
    static let cltchAccent = Color(red: 88 / 255, green: 199 / 255, blue: 255 / 255)
    static let cltchGold = Color(red: 245 / 255, green: 166 / 255, blue: 35 / 255)
    static let cltchMuted = Color(red: 168 / 255, green: 182 / 255, blue: 201 / 255)
    static let cltchSuccess = Color(red: 62 / 255, green: 201 / 255, blue: 117 / 255)
    static let cltchWarning = Color(red: 242 / 255, green: 151 / 255, blue: 39 / 255)
}

struct CLTCHPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(.black)
            .padding(.vertical, 16)
            .frame(maxWidth: .infinity)
            .background(Color.cltchGold.opacity(configuration.isPressed ? 0.85 : 1))
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.99 : 1)
    }
}

extension DashboardMetric {
    var accentColor: Color {
        switch accentKey {
        case "gold":
            return .cltchGold
        case "green":
            return .cltchSuccess
        case "orange":
            return .cltchWarning
        default:
            return .cltchAccent
        }
    }
}
