package models

type ReservationItem struct {
	ID            string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ReservationID string      `gorm:"type:uuid;not null;index" json:"reservation_id"`
	ItemID        string      `gorm:"type:text;not null" json:"item_id"`
	ItemName      string      `gorm:"type:text;not null" json:"item_name"`
	ItemType      string      `gorm:"type:text;not null" json:"item_type"` // "package" or "addon"
	Quantity      int         `gorm:"not null" json:"quantity"`
	Price         int64       `gorm:"not null" json:"price"`
	Subtotal      int64       `gorm:"not null" json:"subtotal"`
}
