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
	now := time.Now()
	dateStr := now.Format("060102")

	var count int64
	config.DB.Model(&models.Reservation{}).Count(&count)

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	randNum := r.Intn(100)

	return fmt.Sprintf("RHCG-%s-%03d%02d", dateStr, count+1, randNum)
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
	PackageName   string `json:"packageName"`
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
		PackageName:   req.PackageName,
		PaxAdult:      req.Dewasa,
		PaxChild:      req.Anak,
		TotalAmount:   0, // Using string in JSON for now
		ItemsJSON:     itemsJSONBytes,
		Status:        "Menunggu Konfirmasi",
	}

	// Buat Booking Code unik (Invoice ID baru dibuat setelah konfirmasi admin)
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	reservation.BookingCode = fmt.Sprintf("RCBO-%05d", r.Intn(90000)+10000)

	// Simpan ke PostgreSQL via GORM
	if err := config.DB.Create(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan reservasi ke database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Reservasi berhasil disimpan",
		"invoice_id":   reservation.InvoiceID,
		"booking_code": reservation.BookingCode,
	})
}

func CheckReservation(c *gin.Context) {
	invoiceID := c.Param("invoiceId")

	var reservation models.Reservation
	if err := config.DB.Where("invoice_id = ? OR booking_code = ?", invoiceID, invoiceID).First(&reservation).Error; err != nil {
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
		"booking_code":  reservation.BookingCode,
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
		"data":    response,
	})
}

func GetAllReservations(c *gin.Context) {
	var reservations []models.Reservation
	if err := config.DB.Order("created_at desc").Find(&reservations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data reservasi"})
		return
	}

	var results []map[string]interface{}
	for _, res := range reservations {
		var itemsData map[string]interface{}
		json.Unmarshal(res.ItemsJSON, &itemsData)
		totalStr, _ := itemsData["totalStr"].(string)
		area, _ := itemsData["area"].(string)

		results = append(results, map[string]interface{}{
			"id":           res.ID,
			"invoice_id":   res.InvoiceID,
			"booking_code": res.BookingCode,
			"nama":         res.CustomerName,
			"wa":           res.CustomerWA,
			"email":        res.CustomerEmail,
			"checkin":      res.CheckIn.Format("02-Jan-06"),
			"checkout":     res.CheckOut.Format("02-Jan-06"),
			"status":       res.Status,
			"dateCreated":  res.CreatedAt.Format(time.RFC3339),
			"total":        totalStr,
			"area":         area,
			"paketText":    res.PackageName, // For MVP we need details
			"addonsText":   itemsData["addonsText"],
			"paymentType":  itemsData["paymentType"],
			"paymentAmount":itemsData["paymentAmount"],
			"pax":          fmt.Sprintf("%d Dewasa, %d Anak", res.PaxAdult, res.PaxChild),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": results,
	})
}

type UpdateStatusRequest struct {
	Status        string `json:"status" binding:"required"`
	PaymentType   string `json:"paymentType"`
	PaymentAmount string `json:"paymentAmount"`
}

func UpdateReservationStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	var reservation models.Reservation
	if err := config.DB.Where("id = ?", id).First(&reservation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
		return
	}

	reservation.Status = req.Status
	if req.Status == "Confirmed" {
		if reservation.InvoiceID == nil || *reservation.InvoiceID == "" {
			invoiceID := generateInvoiceID()
			reservation.InvoiceID = &invoiceID
		}
		
		// Update ItemsJSON with payment details
		var itemsData map[string]interface{}
		json.Unmarshal(reservation.ItemsJSON, &itemsData)
		if itemsData == nil {
			itemsData = make(map[string]interface{})
		}
		itemsData["paymentType"] = req.PaymentType
		itemsData["paymentAmount"] = req.PaymentAmount
		updatedItemsJSON, _ := json.Marshal(itemsData)
		reservation.ItemsJSON = updatedItemsJSON
	}

	if err := config.DB.Save(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status berhasil diupdate",
		"status":  req.Status,
	})
}
