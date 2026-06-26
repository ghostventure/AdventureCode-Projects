package com.cltch.ntwrk.nativeapp.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.cltch.ntwrk.nativeapp.data.SessionRepository
import com.cltch.ntwrk.nativeapp.model.UserRole
import com.cltch.ntwrk.nativeapp.model.UserSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface CLTCHUiState {
    data object Launching : CLTCHUiState
    data object SignedOut : CLTCHUiState
    data class SignedIn(val session: UserSession) : CLTCHUiState
}

class CLTCHViewModel(
    private val repository: SessionRepository = SessionRepository()
) : ViewModel() {
    private val _uiState = MutableStateFlow<CLTCHUiState>(CLTCHUiState.Launching)
    val uiState: StateFlow<CLTCHUiState> = _uiState.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    init {
        bootstrap()
    }

    fun bootstrap() {
        viewModelScope.launch {
            val restored = repository.restore()
            _uiState.value = if (restored != null) CLTCHUiState.SignedIn(restored) else CLTCHUiState.SignedOut
        }
    }

    fun signIn(email: String, password: String, role: UserRole) {
        viewModelScope.launch {
            runCatching {
                repository.signIn(email, password, role)
            }.onSuccess {
                _uiState.value = CLTCHUiState.SignedIn(it)
                _message.value = null
            }.onFailure {
                _message.value = it.message ?: "Sign-in failed."
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            repository.signOut()
            _uiState.value = CLTCHUiState.SignedOut
        }
    }
}
