package com.cltch.ntwrk.nativeapp.data

object DatabaseContract {
    const val PROJECT_ID = "cltch-ntwrk"
    const val AUTH_DOMAIN = "cltch-ntwrk.firebaseapp.com"
    const val STORAGE_BUCKET = "cltch-ntwrk.firebasestorage.app"

    object Collections {
        const val USERS = "users"
        const val USER_ROLES = "userRoles"
        const val HOSTS = "hosts"
        const val MUSICIANS = "musicians"
        const val GIGS = "gigs"
    }

    val ROLE_RESOLUTION_ORDER = listOf(
        "users/{uid}",
        "userRoles/{uid}"
    )
}
