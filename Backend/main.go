package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/OvoCode05/Feels-Like-Summer/config"
	"github.com/OvoCode05/Feels-Like-Summer/db"
	"github.com/go-chi/chi/v5"
)

func main(){
	config.LoadEnv()

	if err := db.ConnectDB(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	port := os.Getenv("PORT")
	fmt.Printf("🚀 Server is running on port %s\n", port)


	router := chi.NewRouter()
	srv := &http.Server{
		Handler : router,
		Addr: ":" + port,
	}

	err := srv.ListenAndServe() //nothing will ever be returned from this function
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}