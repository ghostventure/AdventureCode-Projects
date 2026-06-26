import Foundation

struct Booking: Identifiable, Codable {
    enum State: String, Codable {
        case open
        case pending
        case accepted
        case completed
        case cancelled
    }

    let id: String
    let title: String
    let venue: String
    let location: String
    let dateLabel: String
    let payLabel: String
    let state: State
    let matchScore: Int
    let city: String
    let category: String
    let summary: String
    let tags: [String]
    let timeline: [BookingTimelineStep]
    let nextAction: String
    let counterpartName: String
}

struct BookingTimelineStep: Identifiable, Codable {
    let id: String
    let title: String
    let detail: String
    let isComplete: Bool
}
