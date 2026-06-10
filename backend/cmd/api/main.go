package main

import (
	"fmt"
	"log"
	"os"

	"github.com/aziashary/erhcg/backend/internal/config"
	handler "github.com/aziashary/erhcg/backend/internal/delivery/http"
	"github.com/aziashary/erhcg/backend/internal/delivery/middleware"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/aziashary/erhcg/backend/internal/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/time/rate"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	config.ConnectDatabase()

	// Auto Migrate Tables
	config.DB.Migrator().DropTable(&models.Reservation{})
	err := config.DB.AutoMigrate(&models.User{}, &models.Reservation{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	// Start Reservation Background Scheduler
	utils.StartReservationScheduler(config.DB)

	r := gin.Default()

	// CORS Setup
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Health Check
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// API Routes
	api := r.Group("/api")
	{
		// Auth
		api.POST("/hq-rockshill/login", handler.LoginAdmin)

		// Reservations (Dilindungi Rate Limiter: max 5 requests per second, burst 10)
		api.POST("/reservations", middleware.RateLimit(rate.Limit(5), 10), handler.SubmitReservation)
		api.GET("/reservations/:invoiceId", handler.CheckReservation)

		// Admin Protected Routes
		admin := api.Group("/hq-rockshill")
		admin.Use(middleware.RequireAuth())
		{
			admin.GET("/dashboard", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Welcome to protected admin dashboard"})
			})
			admin.GET("/reservations", handler.GetAllReservations)
			admin.PUT("/reservations/:id/status", handler.UpdateReservationStatus)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	fmt.Printf("Starting Rockshill API on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
