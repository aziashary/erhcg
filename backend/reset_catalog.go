package main

import (
	"log"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConnectDatabase()
	if err := config.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Catalog{}).Error; err != nil {
		log.Fatal(err)
	}
	log.Println("Catalogs deleted!")
}
