package http

import (
	"encoding/json"
	"net/http"
	"time"
	"strconv"
	"strings"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
)

func UpdateReservation(c *gin.Context) {
	id := c.Param("id")

	var req ReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	checkInDate, err1 := time.Parse("2006-01-02", req.Checkin)
	checkOutDate, err2 := time.Parse("2006-01-02", req.Checkout)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal check-in/out tidak valid"})
		return
	}

	var reservation models.Reservation
	if err := config.DB.Preload("Items").Where("id = ?", id).First(&reservation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
		return
	}

	totalClean := strings.ReplaceAll(req.Total, "Rp ", "")
	totalClean = strings.ReplaceAll(totalClean, ".", "")
	totalAmount, _ := strconv.ParseInt(totalClean, 10, 64)

	itemsData := map[string]interface{}{
		"area":       req.Area,
		"jam":        req.JamKedatangan,
		"motor":      req.Motor,
		"mobil":      req.Mobil,
		"paketText":  req.PaketText,
		"addonsText": req.AddonsText,
		"totalStr":   req.Total,
		"totalTents": req.TotalTents,
		"discount":   req.Discount,
		"dpAmount":   req.DPAmount,
	}
	itemsJSONBytes, err := json.Marshal(itemsData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data form"})
		return
	}

	var resItems []models.ReservationItem
	for _, item := range req.Items {
		resItems = append(resItems, models.ReservationItem{
			ReservationID: reservation.ID,
			ItemID:        item.ID,
			ItemName:      item.Name,
			ItemType:      item.Type,
			Quantity:      item.Quantity,
			Price:         item.Price,
			Subtotal:      item.Subtotal,
		})
	}

	paidAmount := int64(0)
	if req.Status == "Confirmed" {
		if req.DPAmount > 0 && req.DPAmount < totalAmount {
			paidAmount = req.DPAmount
		} else {
			paidAmount = totalAmount - req.Discount
		}
	} else if req.Status == "Menunggu Konfirmasi" {
		paidAmount = 0
	} else {
	    paidAmount = reservation.PaidAmount
	}

	reservation.CustomerName = req.Nama
	reservation.CustomerWA = req.WA
	reservation.CustomerEmail = req.Email
	reservation.CheckIn = checkInDate
	reservation.CheckOut = checkOutDate
	reservation.Nights = req.Nights
	reservation.PaxAdult = req.Dewasa
	reservation.PaxChild = req.Anak
	reservation.TotalAmount = totalAmount
	reservation.Status = req.Status
	reservation.PaidAmount = paidAmount
	reservation.ItemsJSON = datatypes.JSON(itemsJSONBytes)

	// Mulai Transaction untuk update parent dan child
	tx := config.DB.Begin()

	// Update data utama
	if err := tx.Save(&reservation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update reservasi"})
		return
	}

	// Hapus items lama
	if err := tx.Where("reservation_id = ?", reservation.ID).Delete(&models.ReservationItem{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus items lama"})
		return
	}

	// Masukkan items baru
	for _, item := range resItems {
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan items baru"})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message":      "Reservasi berhasil diupdate",
		"booking_code": reservation.BookingCode,
		"invoice_id":   reservation.InvoiceID,
	})
}

func GetReservationByID(c *gin.Context) {
	id := c.Param("id")
	var reservation models.Reservation
	if err := config.DB.Preload("Items").Where("id = ?", id).First(&reservation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": reservation})
}

type POSRequest struct {
	NewItems        []models.ReservationItem `json:"newItems"`
	NewAddonsText   string                   `json:"newAddonsText"`
	AdditionalTotal int64                    `json:"additionalTotal"`
}

func POSCheckout(c *gin.Context) {
	id := c.Param("id")
	var req POSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	var reservation models.Reservation
	if err := config.DB.Preload("Items").Where("id = ?", id).First(&reservation).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservasi tidak ditemukan"})
		return
	}

	tx := config.DB.Begin()

	for _, item := range req.NewItems {
		resItem := models.ReservationItem{
			ReservationID: reservation.ID,
			ItemID:        item.ItemID,
			ItemName:      item.ItemName,
			ItemType:      item.ItemType,
			Quantity:      item.Quantity,
			Price:         item.Price,
			Subtotal:      item.Subtotal,
		}
		if err := tx.Create(&resItem).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah item pos"})
			return
		}
	}

	// POS ALWAYS makes it LUNAS, and adds new total
	reservation.TotalAmount += req.AdditionalTotal
	reservation.PaidAmount = reservation.TotalAmount
	reservation.Status = "Confirmed"

	// Update ItemsJSON safely
	var itemsData map[string]interface{}
	if err := json.Unmarshal(reservation.ItemsJSON, &itemsData); err == nil {
		oldAddons, _ := itemsData["addonsText"].(string)
		if oldAddons != "" && req.NewAddonsText != "" {
			itemsData["addonsText"] = oldAddons + ", " + req.NewAddonsText
		} else if req.NewAddonsText != "" {
			itemsData["addonsText"] = req.NewAddonsText
		}

		// Helper to format string since we don't have formatRupiah easily in go without helper
		// But we can just build totalStr using logic or simply not update totalStr 
		// Actually, let's just format it simple
		// We'll trust frontend to read TotalAmount, but some older parts read totalStr
		// Convert TotalAmount to string with Rp
		// Format int64 with dots is complex, we just set totalStr as "Rp " + strconv.FormatInt(reservation.TotalAmount, 10)
		itemsData["totalStr"] = "Rp " + strconv.FormatInt(reservation.TotalAmount, 10) // Basic fallback

		b, _ := json.Marshal(itemsData)
		reservation.ItemsJSON = datatypes.JSON(b)
	}

	if err := tx.Save(&reservation).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update reservasi"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaksi POS Berhasil",
	})
}

type OTSRequest struct {
	Nama          string `json:"nama" binding:"required"`
	AreaCamp      string `json:"area_camp" binding:"required"`
	Dewasa        int    `json:"dewasa"`
	PaymentAmount int    `json:"payment_amount"`
	Total         int    `json:"total"`
	Items         []struct {
		ItemID   string `json:"item_id"`
		ItemName string `json:"item_name"`
		ItemType string `json:"item_type"`
		Quantity int    `json:"quantity"`
		Price    int    `json:"price"`
		Subtotal int    `json:"subtotal"`
	} `json:"items"`
}

func SubmitOTSReservation(c *gin.Context) {
	var req OTSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid: " + err.Error()})
		return
	}

	loc, _ := time.LoadLocation("Asia/Jakarta")
	now := time.Now().In(loc)
	checkIn := now
	checkOut := now.Add(24 * time.Hour)

	invoiceIDStr := generateInvoiceID()
	invoiceID := &invoiceIDStr
	bookingCode := "OTS-" + time.Now().Format("060102150405")

	var itemsJson = make(map[string]interface{})
	itemsJson["area"] = req.AreaCamp
	
	var totalTents int
	var itemsList []map[string]interface{}
	for _, it := range req.Items {
		itemsList = append(itemsList, map[string]interface{}{
			"id":       it.ItemID,
			"name":     it.ItemName,
			"category": it.ItemType,
			"quantity": it.Quantity,
			"price":    it.Price,
			"subtotal": it.Subtotal,
		})
		if it.ItemType == "package" {
			totalTents += it.Quantity
		}
	}
	itemsJson["totalTents"] = totalTents
	
	bytes, _ := json.Marshal(itemsJson)

	res := models.Reservation{
		BookingCode:   bookingCode,
		InvoiceID:     invoiceID,
		CustomerName:  req.Nama,
		CustomerWA:    "OTS",
		CheckIn:       checkIn,
		CheckOut:      checkOut,
		Nights:        1,
		PaxAdult:      req.Dewasa, // Gunakan input dewasa
		TotalAmount:   int64(req.Total),
		PaidAmount:    int64(req.PaymentAmount),
		Status:        "Confirmed",
		ItemsJSON:     datatypes.JSON(bytes),
	}

	tx := config.DB.Begin()

	if err := tx.Create(&res).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan reservasi OTS: " + err.Error()})
		return
	}

	// Insert items
	for _, it := range req.Items {
		resItem := models.ReservationItem{
			ReservationID: res.ID,
			ItemID:        it.ItemID,
			ItemName:      it.ItemName,
			ItemType:      it.ItemType,
			Quantity:      it.Quantity,
			Price:         int64(it.Price),
			Subtotal:      int64(it.Subtotal),
		}
		if err := tx.Create(&resItem).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan item OTS: " + err.Error()})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "Reservasi OTS berhasil dibuat dan lunas", "data": res})
}
