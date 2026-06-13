package main

import (
	"log"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env file not found")
	}

	config.ConnectDatabase()

	items := []models.Catalog{
		{
			ID:          uuid.New().String(),
			KeyID:       "htm_paket",
			Name:        "HTM (Paket)",
			Category:    "htm",
			Price:       35000,
			BillingType: "flat",
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			KeyID:       "htm_ots",
			Name:        "HTM (OTS)",
			Category:    "htm",
			Price:       45000,
			BillingType: "flat",
			IsActive:    true,
		},
	}

	for _, item := range items {
		var existing models.Catalog
		if err := config.DB.Where("key_id = ?", item.KeyID).First(&existing).Error; err != nil {
			if err := config.DB.Create(&item).Error; err != nil {
				log.Printf("Failed to insert %s: %v\n", item.Name, err)
			} else {
				log.Printf("Inserted %s successfully.\n", item.Name)
			}
		} else {
			existing.Name = item.Name
			existing.Price = item.Price
			existing.Category = item.Category
			config.DB.Save(&existing)
			log.Printf("Updated %s successfully.\n", item.Name)
		}
	}
}
