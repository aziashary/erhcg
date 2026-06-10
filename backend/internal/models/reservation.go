package models

import (
	"time"

	"gorm.io/datatypes"
)

type Reservation struct {
	ID            string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	InvoiceID     *string        `gorm:"type:text;unique"`
	BookingCode   string         `gorm:"type:text;unique;not null"`
	CustomerName  string         `gorm:"type:text;not null"`
	CustomerWA    string         `gorm:"type:text;not null"`
	CustomerEmail string         `gorm:"type:text"`
	CheckIn       time.Time      `gorm:"type:date;not null"`
	CheckOut      time.Time      `gorm:"type:date;not null"`
	Nights        int            `gorm:"not null"`
	PackageName   string         `gorm:"type:text;not null"`
	PaxAdult      int            `gorm:"not null"`
	PaxChild      int            `gorm:"default:0"`
	TotalAmount   int64          `gorm:"not null"`
	Status        string         `gorm:"type:text;default:'pending'"`
	ItemsJSON     datatypes.JSON `gorm:"type:jsonb;not null"`
	CreatedAt     time.Time      `gorm:"default:timezone('utc'::text, now())"`
}
