package main

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func (apiCfg *apiConfig) handlerLogin(w http.ResponseWriter, r *http.Request) {
	var params LoginParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		responWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Step 1: Get user from DB
	user, err := apiCfg.DB.GetUserByEmail(r.Context(), params.Email)
	if err != nil {
		responWithError(w, http.StatusUnauthorized, "Email or password is incorrect")
		return
	}

	// Step 2: Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(params.Password))
	if err != nil {
		responWithError(w, http.StatusUnauthorized, "Email or password is incorrect")
		return
	}

	// Step 3: Create JWT
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		responWithError(w, http.StatusInternalServerError, "Failed to sign token")
		return
	}

	// Step 4: Return JWT
	respondWithJSON(w, http.StatusOK, map[string]string{
		"token": tokenString,
	})
}
