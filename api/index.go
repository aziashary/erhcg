package api

import (
	"net/http"

	"github.com/aziashary/erhcg/backend/internal/config"
	handler "github.com/aziashary/erhcg/backend/internal/delivery/http"
	"github.com/aziashary/erhcg/backend/internal/delivery/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

var app *gin.Engine

func init() {
	// Initialize the Database
	config.ConnectDatabase()

	// Create the Gin app
	app = gin.Default()

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	app.Use(cors.New(corsConfig))

	// API Routes
	apiGroup := app.Group("/api")
	{
		// Auth
		apiGroup.POST("/hq-rockshill/login", handler.LoginAdmin)

		// Reservations
		apiGroup.POST("/reservations", middleware.RateLimit(rate.Limit(5), 10), handler.SubmitReservation)
		apiGroup.GET("/reservations/:invoiceId", handler.CheckReservation)

		// Admin Protected Routes
		admin := apiGroup.Group("/hq-rockshill")
		admin.Use(middleware.RequireAuth())
		{
			admin.GET("/dashboard", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "Welcome to protected admin dashboard"})
			})
			admin.GET("/reservations", handler.GetAllReservations)
			admin.PUT("/reservations/:id/status", handler.UpdateReservationStatus)
		}
	}
}

// Handler is the entry point for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
