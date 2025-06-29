package main

import (
	"net/http"
)

func handleErr(w http.ResponseWriter, r *http.Request) {
	responWithError(w, 400, "Something Went Wrong")
} 