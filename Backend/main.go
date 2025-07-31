package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/OvoCode05/Feels-Like-Summer/config"
	db "github.com/OvoCode05/Feels-Like-Summer/db/generated"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	_ "github.com/lib/pq" // PostgreSQL driver
)

type apiConfig struct{
	DB *db.Queries
}

func main(){
	config.LoadEnv()

	
	port := os.Getenv("PORT")
	fmt.Printf("🚀 Server is running on port %s\n", port)

	dbUrl := os.Getenv("DB_SOURCE")
	if dbUrl == "" {
		log.Fatal("DB_SOURCE environment variable is not set")
	}
	conn, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}


	apiCfg := apiConfig{
		DB: db.New(conn),
	}

	router := chi.NewRouter()
	//cors configuration - people can make requests to the server from any origin
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, 
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, 
		AllowedHeaders:   []string{"*"}, 
		ExposedHeaders:   []string{"Link"},	
		AllowCredentials: false,
		MaxAge:           300, // Cache preflight response for 5 minutes
	}))

	v1Router := chi.NewRouter()
	// Define your API routes here
	v1Router.Get("/healthz", handler_readiness) // Readiness check endpoint
	v1Router.Get("/err", handleErr)
	v1Router.Post("/register_user", apiCfg.handlerCreateUser)
	v1Router.Post("/login", apiCfg.handlerLogin) // Login endpoint
	v1Router.Post("/update", apiCfg.UpdateUserProfile) // Update user profile endpoint
	router.Mount("/", v1Router)

	srv := &http.Server{
		Handler : router,
		Addr: ":" + port,
	}

	err = srv.ListenAndServe() //nothing will ever be returned from this function
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}