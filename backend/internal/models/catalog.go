package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Catalog struct {
	ID          string    `gorm:"type:uuid;primaryKey" json:"id"`
	KeyID       string    `gorm:"uniqueIndex;not null" json:"key_id"` // e.g., 'lengkap_4p', 'paket_grill'
	Name        string    `gorm:"not null" json:"name"`
	Category    string    `gorm:"not null" json:"category"` // 'package' or 'addon'
	Price       float64   `gorm:"not null;default:0" json:"price"`
	Capacity    int       `gorm:"default:0" json:"capacity"` // For packages
	HTM         string    `json:"htm"`                       // For packages: 'included', 'not_included', 'special'
	BillingType string    `json:"billing_type"`              // For addons: 'night', 'flat'
	Description string    `gorm:"type:text" json:"description"` // Store JSON string array
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (c *Catalog) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return
}
