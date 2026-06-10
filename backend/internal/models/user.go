package models

import (
	"time"
)

type User struct {
	ID           string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Username     string    `gorm:"type:text;unique;not null"`
	PasswordHash string    `gorm:"type:text;not null"`
	Role         string    `gorm:"type:text;default:'admin'"`
	CreatedAt    time.Time `gorm:"default:timezone('utc'::text, now())"`
}
