import Foundation

enum FirestoreCollection: String {
    case users
    case userRoles
    case hosts
    case musicians
    case gigs

    var path: String { rawValue }
}

struct FirebaseProjectConfig {
    let projectId = "cltch-ntwrk"
    let authDomain = "cltch-ntwrk.firebaseapp.com"
    let storageBucket = "cltch-ntwrk.firebasestorage.app"
}

enum NativeSyncNotes {
    static let roleResolutionOrder = [
        "users/{uid}",
        "userRoles/{uid}"
    ]

    static let bookingSource = "gigs/{gigId}"
    static let hostProfileSource = "hosts/{uid}"
    static let musicianProfileSource = "musicians/{uid}"
}
