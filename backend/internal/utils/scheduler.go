package utils

import (
	"log"
	"time"

	"gorm.io/gorm"
)

func runMaintenance(db *gorm.DB) {
	log.Println("[Scheduler] Running reservation maintenance job...")

	// 1. Update status ke "Expired" jika belum bayar dalam 1 jam
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	resExpired := db.Table("reservations").
		Where("status = ? AND created_at < ?", "Menunggu Konfirmasi", oneHourAgo).
		Update("status", "Expired")
	
	if resExpired.Error != nil {
		log.Printf("[Scheduler] Error updating expired reservations: %v\n", resExpired.Error)
	} else if resExpired.RowsAffected > 0 {
		log.Printf("[Scheduler] Successfully expired %d reservations\n", resExpired.RowsAffected)
	}

	// 2. Hapus permanen data yang berstatus "Expired" dan berusia > 7 hari
	sevenDaysAgo := time.Now().Add(-7 * 24 * time.Hour)
	resDeleted := db.Table("reservations").
		Where("status = ? AND created_at < ?", "Expired", sevenDaysAgo).
		Delete(nil)

	if resDeleted.Error != nil {
		log.Printf("[Scheduler] Error deleting old expired reservations: %v\n", resDeleted.Error)
	} else if resDeleted.RowsAffected > 0 {
		log.Printf("[Scheduler] Successfully hard-deleted %d old expired reservations\n", resDeleted.RowsAffected)
	}
}

// StartReservationScheduler starts the background ticker to maintain reservations.
func StartReservationScheduler(db *gorm.DB) {
	go func() {
		// Wait a brief moment for database connection and app start stability
		time.Sleep(2 * time.Second)
		runMaintenance(db)

		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			runMaintenance(db)
		}
	}()
}
