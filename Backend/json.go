package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func responWithError(w http.ResponseWriter, code int, msg string){
	if code > 499 {  // If the error code is 500 or above, log it as a server error
		log.Printf("Server error: %s", msg)
	} 
	type errResponse struct {
		Error string `json:"error"`
	} // Define a struct for the error response (json object)

	respondWithJSON(w, code, errResponse{
		Error: msg,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	dat, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal JSON response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code) // use the 'code' argument here
	w.Write(dat)
}