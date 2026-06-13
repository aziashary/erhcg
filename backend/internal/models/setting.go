package models

import "time"

type Setting struct {
	Key       string    `gorm:"primaryKey" json:"key"` // e.g., 'whatsapp_number', 'bank_account'
	Value     string    `gorm:"not null" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
