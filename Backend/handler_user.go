package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	db "github.com/OvoCode05/Feels-Like-Summer/db/generated"
	"github.com/google/uuid"
)

func (apiCfg *apiConfig) handlerCreateUser(w http.ResponseWriter, r * http.Request) {
	type parameters struct {
		Name string `json:"Name"`
		Email string `json:"email"`
		Password string `json:"password"`
		Role string `json:"role"`
	}
	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		responWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := apiCfg.DB.CreateUser(r.Context(), db.CreateUserParams{
		ID: uuid.New(),
		Name: params.Name,
		Email: params.Email,
		Password: params.Password,
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