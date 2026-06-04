package http

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func generateInvoiceID() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return fmt.Sprintf("INV-RSHL-%d", r.Intn(90000)+10000)
}

type ReservationRequest struct {
	Nama          string `json:"nama" binding:"required"`
	WA            string `json:"wa" binding:"required"`
	Email         string `json:"email"`
	Dewasa        int    `json:"dewasa" binding:"required"`
	Anak          int    `json:"anak"`
	Motor         int    `json:"motor"`
	Mobil         int    `json:"mobil"`
	Checkin       string `json:"checkin" binding:"required"`
	Checkout      string `json:"checkout" binding:"required"`
	JamKedatangan string `json:"jamKedatangan" binding:"required"`
	Nights        int    `json:"nights" binding:"required"`
	Area          string `json:"area" binding:"required"`
	PaketText     string `json:"paketText"`
	AddonsText    string `json:"addonsText"`
	Total         string `json:"total"`
}

func SubmitReservation(c *gin.Context) {
	var req ReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	// Parsing dates
	checkInDate, _ := time.Parse("2006-01-02", req.Checkin)
	checkOutDate, _ := time.Parse("2006-01-02", req.Checkout)

	// Build JSON items
	itemsData := map[string]interface{}{
		"area":       req.Area,
		"jam":        req.JamKedatangan,
		"motor":      req.Motor,
		"mobil":      req.Mobil,
		"paketText":  req.PaketText,
		"addonsText": req.AddonsText,
		"totalStr":   req.Total,
	}
	itemsJSONBytes, _ := json.Marshal(itemsData)

	reservation := models.Reservation{
		CustomerName:  req.Nama,
		CustomerWA:    req.WA,
		CustomerEmail: req.Email,
		CheckIn:       checkInDate,
		CheckOut:      checkOutDate,
		Nights:        req.Nights,
		PackageName   : "Sesuai Detail", // Simplified for MVP
		PaxAdult      : req.Dewasa,
		PaxChild      : req.Anak,
		TotalAmount   : 0, // Using string in JSON for now
		ItemsJSON     : itemsJSONBytes,
		Status        : "Menunggu Konfirmasi",
	}

	// Buat ID Invoice unik
	reservation.InvoiceID = generateInvoiceID()

	// Simpan ke PostgreSQL via GORM
	if err := config.DB.Create(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan reservasi ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Reservasi berhasil disimpan",
		"invoice_id": reservation.InvoiceID,
	})
}

func CheckReservation(c *gin.Context) {
	invoiceID := c.Param("invoiceId")

	var reservation models.Reservation
	if err := config.DB.Where("invoice_id = ?", invoiceID).First(&reservation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
		return
	}

	// Parse ItemsJSON to get extra fields
	var itemsData map[string]interface{}
	json.Unmarshal(reservation.ItemsJSON, &itemsData)

	// Safe type assertions
	jamKedatangan, _ := itemsData["jam"].(string)
	area, _ := itemsData["area"].(string)
	paketText, _ := itemsData["paketText"].(string)
	addonsText, _ := itemsData["addonsText"].(string)
	totalStr, _ := itemsData["totalStr"].(string)

	response := map[string]interface{}{
		"id":            reservation.InvoiceID,
		"nama":          reservation.CustomerName,
		"wa":            reservation.CustomerWA,
		"email":         reservation.CustomerEmail,
		"checkin":       reservation.CheckIn.Format("2006-01-02"),
		"checkout":      reservation.CheckOut.Format("2006-01-02"),
		"nights":        reservation.Nights,
		"dewasa":        reservation.PaxAdult,
		"anak":          reservation.PaxChild,
		"status":        reservation.Status,
		"dateCreated":   reservation.CreatedAt.Format(time.RFC3339),
		"jamKedatangan": jamKedatangan,
		"area":          area,
		"paketText":     paketText,
		"addonsText":    addonsText,
		"total":         totalStr,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true, // Added for React CheckReservation.jsx condition
		"data": response,
	})
}
