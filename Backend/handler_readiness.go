package main

import "net/http"

func handlerReadiness(w http.ResponseWriter, r *http.Request) {
	// This endpoint is used to check if the server is ready to handle requests.
	// It can be used by load balancers or health check systems.
	respondWithJSON(w,200, struct{}{})
}

//respond if the server is alive and running