package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/joho/godotenv"
	"gorm.io/datatypes"
)

func genCode(i int) string {
	return fmt.Errorf("RSHL-SD%03d", i).Error()
}

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: .env file not found")
	}

	config.ConnectDatabase()

	// Clear existing reservations
	config.DB.Exec("TRUNCATE TABLE reservations CASCADE")

	fmt.Println("Seeding reservations for June 13, 14, 15, 16 (2026)...")

	// Helper to create item JSON
	createJSON := func(area string, tents int, paketText string, jam string) datatypes.JSON {
		m := map[string]interface{}{
			"area":       area,
			"totalTents": tents,
			"paketText":  paketText,
			"jam":        jam,
		}
		b, _ := json.Marshal(m)
		return datatypes.JSON(b)
	}

	dates := []string{"2026-06-13", "2026-06-14", "2026-06-15", "2026-06-16"}

	// Seed Data Structure
	// We want mix of DP and Lunas, matching capacity
	type seedDef struct {
		Area     string
		Tents    int
		Paket    string
		Status   string
		TotalAmt int64
		PaidAmt  int64
	}

	seeds := map[string][]seedDef{
		"2026-06-13": {
			{"Area 1", 2, "2x Paket Lengkap 4P", "Confirmed", 1080000, 500000}, // DP
			{"Area 2", 3, "3x Paket Konten 2P", "Confirmed", 870000, 870000},   // Lunas
			{"Campervan", 1, "1x Bawa Tenda Sendiri", "Confirmed", 0, 0},     // Lunas/Free? Wait, tenda sendiri requires HTM. Total = 30000
			{"Area 3", 5, "5x Paket Fullset 4P", "Menunggu Konfirmasi", 1200000, 0},
		},
		"2026-06-14": {
			{"Area 4", 3, "3x Paket Lengkap 2P", "Confirmed", 1470000, 1470000}, // Lunas
			{"Area 5", 2, "2x Paket Konten 4P", "Confirmed", 680000, 300000},    // DP
		},
		"2026-06-15": {
			{"Area 6", 2, "2x Paket Lengkap 4P", "Confirmed", 1080000, 500000}, // DP
			{"Area 7", 2, "2x Paket Konten 2P", "Menunggu Konfirmasi", 580000, 0},
		},
		"2026-06-16": {
			{"Area 8", 3, "3x Bawa Tenda Sendiri", "Confirmed", 90000, 90000},    // Lunas
			{"Area 2", 2, "2x Paket Lengkap 4P", "Confirmed", 1080000, 500000},   // DP
			{"Area 4 Samping", 1, "1x Paket Konten 2P", "Confirmed", 290000, 150000}, // DP
		},
	}

	idx := 1
	for _, dateStr := range dates {
		checkin, _ := time.Parse("2006-01-02", dateStr)
		checkout := checkin.AddDate(0, 0, 1)

		for _, s := range seeds[dateStr] {
			invID := fmt.Sprintf("INV-26061%02d", idx)
			var invPtr *string
			if s.Status == "Confirmed" {
				invPtr = &invID
			}

			if s.Area == "Campervan" && s.TotalAmt == 0 {
				s.TotalAmt = 30000
				s.PaidAmt = 30000
			}

			res := models.Reservation{
				BookingCode:  fmt.Sprintf("RSHL-SD%03d", idx),
				InvoiceID:    invPtr,
				CustomerName: fmt.Sprintf("Dummy User %d", idx),
				CustomerWA:   "08123456789",
				CheckIn:      checkin,
				CheckOut:     checkout,
				Nights:       1,
				PaxAdult:     s.Tents * 2,
				TotalAmount:  s.TotalAmt,
				Status:       s.Status,
				PaidAmount:   s.PaidAmt,
				ItemsJSON:    createJSON(s.Area, s.Tents, s.Paket, "14:00"),
			}

			if err := config.DB.Create(&res).Error; err != nil {
				log.Println("Err:", err)
			}
			idx++
		}
	}

	fmt.Println("Reservations seeded successfully!")
}
