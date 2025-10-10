package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"

	"backend/config"
	"backend/models"
	"backend/routers"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found")
	}

	// Initialize Database
	config.InitDB()
	config.DB.AutoMigrate(&models.User{}, &models.Projects{})

	// Initialize Echo
	e := echo.New()

	// Setup Routes
	routers.SetupRoutes(e)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
