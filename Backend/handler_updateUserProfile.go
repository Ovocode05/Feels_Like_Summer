package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	db "github.com/OvoCode05/Feels-Like-Summer/db/generated"
	"github.com/sqlc-dev/pqtype"
)

func (apiCfg *apiConfig) UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Email            string   `json:"email"` // ✅ needed for lookup
		Department       string   `json:"department"`
		Year             string   `json:"year"`
		Major            string   `json:"major"`
		ResearchInterest string   `json:"research_interest"`
		IsAvailable      bool     `json:"is_available"`
		Links            []string `json:"links"`
		Skills           []string `json:"skills"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	if err := decoder.Decode(&params); err != nil {
		responWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// JSON encode Links and Skills into []byte
	linksJSON, err := json.Marshal(params.Links)
	if err != nil {
		responWithError(w, http.StatusInternalServerError, "Failed to encode links")
		return
	}

	skillsJSON, err := json.Marshal(params.Skills)
	if err != nil {
		responWithError(w, http.StatusInternalServerError, "Failed to encode skills")
		return
	}

	// Parse year safely
	var year sql.NullInt32
	if params.Year != "" {
		if y, err := strconv.Atoi(params.Year); err == nil {
			year = sql.NullInt32{Int32: int32(y), Valid: true}
		}
	}

	// Construct SQLC params
	updateParams := db.UpdateUserProfileParams{
		Email:            params.Email,
		Department:       sql.NullString{String: params.Department, Valid: params.Department != ""},
		Year:             year,
		Major:            sql.NullString{String: params.Major, Valid: params.Major != ""},
		ResearchInterest: sql.NullString{String: params.ResearchInterest, Valid: params.ResearchInterest != ""},
		IsAvailable:      sql.NullBool{Bool: params.IsAvailable, Valid: true},
		Links:            pqtype.NullRawMessage{RawMessage: linksJSON, Valid: true},
		Skills:           pqtype.NullRawMessage{RawMessage: skillsJSON, Valid: true},
	}

	user, err := apiCfg.DB.UpdateUserProfile(r.Context(), updateParams)
	if err != nil {
		responWithError(w, 500, fmt.Sprintf("Failed to update user: %v", err))
		return
	}

	respondWithJSON(w, http.StatusOK, user)
}
