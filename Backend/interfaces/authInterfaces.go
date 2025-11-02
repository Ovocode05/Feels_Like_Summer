package interfaces

import "backend/models"

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Name     string          `json:"name"`
	Email    string          `json:"email"`
	Password string          `json:"password"`
	Type     models.UserType `json:"type"`
}

type SendVerificationCodeRequest struct {
	Email string `json:"email"`
}

type VerifyCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type VerifyEmailRequest struct {
	Token string `json:"token"`
}

type ResendVerificationRequest struct {
	Email string `json:"email"`
}
