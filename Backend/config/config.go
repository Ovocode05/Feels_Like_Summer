package config

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv(){
	err := godotenv.Load() //main and .env files at the same level
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	fmt.Println("✅ .env loaded successfully")
}