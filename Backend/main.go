package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/OvoCode05/Feels-Like-Summer/config"
	// Initialize the config package to load environment variables
	"github.com/OvoCode05/Feels-Like-Summer/db"
	// Initialize the db package to connect to the database
)

func main(){
	config.LoadEnv()

	if err := db.ConnectDB(); err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	port := os.Getenv("PORT")
	fmt.Printf("🚀 Server is running on port %s\n", port)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		w.Write([]byte("Welcome to Feels Like Summer!"))
	})

	log.Fatal(http.ListenAndServe(":"+port, nil))
}