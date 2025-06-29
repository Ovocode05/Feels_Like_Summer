package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/OvoCode05/Feels-Like-Summer/config"
	"github.com/OvoCode05/Feels-Like-Summer/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func main(){
	config.LoadEnv()

	if err := db.ConnectDB(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	port := os.Getenv("PORT")
	fmt.Printf("🚀 Server is running on port %s\n", port)


	router := chi.NewRouter()
	//cors configuration - people can make requests to the server from any origin
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, 
		AllowedHeaders:   []string{"*"}, 
		ExposedHeaders:   []string{"Link"},	
		AllowCredentials: true,
		MaxAge:           300, // Cache preflight response for 5 minutes
	}))

	v1Router := chi.NewRouter()
	// Define your API routes here
	v1Router.Get("/healthz", handler_readiness) // Readiness check endpoint
	v1Router.Get("/err", handleErr)
	router.Mount("/v1", v1Router)

	srv := &http.Server{
		Handler : router,
		Addr: ":" + port,
	}

	err := srv.ListenAndServe() //nothing will ever be returned from this function
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}