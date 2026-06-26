import Foundation

enum UserRole: String, CaseIterable, Identifiable, Codable {
    case host
    case musician

    var id: String { rawValue }

    var title: String {
        switch self {
        case .host:
            return "Host"
        case .musician:
            return "Musician / DJ"
        }
    }
}
