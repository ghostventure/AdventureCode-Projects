import Foundation

struct UserSession: Identifiable, Codable {
    let id: String
    let email: String
    let displayName: String
    let role: UserRole
    let city: String
    let state: String
    let completionPercent: Int
    let status: String
    let upcomingBookings: [Booking]
    let metrics: [DashboardMetric]
    let spotlightActions: [WorkspaceAction]
    let radarMatches: [Booking]
    let profileFacts: [ProfileFact]
    let supportItems: [SupportItem]
}

struct DashboardMetric: Identifiable, Codable {
    let id: String
    let title: String
    let value: String
    let accentKey: String
}

struct WorkspaceAction: Identifiable, Codable {
    let id: String
    let title: String
    let detail: String
}

struct ProfileFact: Identifiable, Codable {
    let id: String
    let label: String
    let value: String
}

struct SupportItem: Identifiable, Codable {
    let id: String
    let title: String
    let detail: String
    let status: String
}
