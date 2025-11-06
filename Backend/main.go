package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

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
	config.DB.AutoMigrate(
		&models.User{},
		&models.Projects{},
		&models.PasswordReset{},
		&models.ProjRequests{},
		&models.EmailVerification{},
		&models.Students{},
		&models.ResearchPreference{},
		&models.PlacementPreference{},
		&models.Roadmap{},
		&models.RoadmapCache{},
	)

	// Initialize Echo
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000", "https://feels-like-summer.vercel.app"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
		AllowCredentials: true,
	}))
	// Setup Routes
	routers.SetupRoutes(e)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
