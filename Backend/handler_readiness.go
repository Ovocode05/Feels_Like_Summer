package main

import "net/http"

func handler_readiness(w http.ResponseWriter, r *http.Request) { //pointer to http request
	respondWithJSON(w,200, struct{}{})
}