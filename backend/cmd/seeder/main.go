package main

import (
	"fmt"
	"log"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env file not found")
	}

	config.ConnectDatabase()
	config.DB.Migrator().DropTable(&models.User{})
	config.DB.AutoMigrate(&models.User{})

	username := "admin"
	password := "admin123"

	// Check if admin already exists
	var user models.User
	if err := config.DB.Where("username = ?", username).First(&user).Error; err == nil {
		fmt.Println("Admin user already exists.")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	newUser := models.User{
		Username:     username,
		PasswordHash: string(hash),
		Role:         "admin",
	}

	if err := config.DB.Create(&newUser).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	fmt.Println("Admin user created successfully! Username:", username)
}
