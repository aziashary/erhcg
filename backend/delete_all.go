package main

import (
	"fmt"
	"log"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	config.ConnectDatabase()

	if err := config.DB.Exec("DELETE FROM reservation_items").Error; err != nil {
		log.Fatal(err)
	}
	if err := config.DB.Exec("DELETE FROM reservations").Error; err != nil {
		log.Fatal(err)
	}

	fmt.Println("All reservations and items successfully deleted from PostgreSQL!")
}
