package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	db "github.com/OvoCode05/Feels-Like-Summer/db/generated"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func (apiCfg *apiConfig) handlerCreateUser(w http.ResponseWriter, r * http.Request) {
	type parameters struct {
		Name string `json:"name"`
		Email string `json:"email"`
		Password string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
		Role string `json:"role"`
	}
	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		responWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if params.Password != params.ConfirmPassword {
		responWithError(w, http.StatusBadRequest, "Passwords do not match")
		return
	}

	// 🔐 Hash the password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		responWithError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	user, err := apiCfg.DB.CreateUser(r.Context(), db.CreateUserParams{
		ID: uuid.New(),
		Name: params.Name,
		Email: params.Email,
		Password: string(hashedPassword),
		Role: params.Role,
	})

	if err != nil {
		if err.Error() == "duplicate key value violates unique constraint \"users_name_key\"" {
			responWithError(w, 409, "User with this name already exists")
			return
		}
		responWithError(w, 500, fmt.Sprintf("Failed to create user: %v", err))
		return
	}
	
	respondWithJSON(w, http.StatusOK, user)
}