package main

import (
	"fmt"
	"log"
	"github.com/joho/godotenv"

	"github.com/aziashary/erhcg/backend/internal/config"
)

func main() {
    godotenv.Load()
	config.ConnectDatabase()
	db := config.DB

	if err := db.Exec("TRUNCATE TABLE reservation_items RESTART IDENTITY CASCADE").Error; err != nil {
		log.Println("Failed to truncate reservation_items:", err)
	}
	if err := db.Exec("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE").Error; err != nil {
		log.Println("Failed to truncate reservations:", err)
	}

	fmt.Println("Successfully truncated reservations and reservation_items tables.")
}
