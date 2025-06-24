package config

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv(){
	err := godotenv.Load() //returns an error
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	fmt.Println("✅ .env loaded successfully")
}