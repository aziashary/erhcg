package http

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
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

func formatRupiah(amount int64) string {
	s := strconv.FormatInt(amount, 10)
	n := len(s)
	if n <= 3 {
		return "Rp " + s
	}
	var res []byte
	for i := 0; i < n; i++ {
		if i > 0 && (n-i)%3 == 0 {
			res = append(res, '.')
		}
		res = append(res, s[i])
	}
	return "Rp " + string(res)
}

type ReservationRequest struct {
	Nama          string                   `json:"nama" binding:"required"`
	WA            string                   `json:"wa" binding:"required"`
	Email         string                   `json:"email"`
	Dewasa        int                      `json:"dewasa" binding:"required"`
	Anak          int                      `json:"anak"`
	Motor         int                      `json:"motor"`
	Mobil         int                      `json:"mobil"`
	Checkin       string                   `json:"checkin" binding:"required"`
	Checkout      string                   `json:"checkout" binding:"required"`
	JamKedatangan string                   `json:"jamKedatangan" binding:"required"`
	Nights        int                      `json:"nights"`
	PaxAdult      int                      `json:"jml_dewasa"`
	PaxChild      int                      `json:"jml_anak"`
	Area          string                   `json:"area" binding:"required"`
	PaketText     string                   `json:"paketText"`
	AddonsText    string                   `json:"addonsText"`
	PackageName   string                   `json:"packageName"`
	Total         string                   `json:"total"`
	TotalTents    int                      `json:"totalTents"`
	Items         []ReservationItemRequest `json:"items"`
	Status        string                   `json:"status"`
	DPAmount      int64                    `json:"dpAmount"`
	Discount      int64                    `json:"discount"`
}

type ReservationItemRequest struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"`
	Quantity int    `json:"quantity"`
	Price    int64  `json:"price"`
	Subtotal int64  `json:"subtotal"`
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
		"totalTents": req.TotalTents,
		"discount":   req.Discount,
		"dpAmount":   req.DPAmount,
	}
	itemsJSONBytes, _ := json.Marshal(itemsData)

	totalClean := strings.ReplaceAll(req.Total, "Rp ", "")
	totalClean = strings.ReplaceAll(totalClean, ".", "")
	totalAmount, _ := strconv.ParseInt(totalClean, 10, 64)

	var resItems []models.ReservationItem
	for _, item := range req.Items {
		resItems = append(resItems, models.ReservationItem{
			ItemID:   item.ID,
			ItemName: item.Name,
			ItemType: item.Type,
			Quantity: item.Quantity,
			Price:    item.Price,
			Subtotal: item.Subtotal,
		})
	}

	// Buat Booking Code unik
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	bookingCode := fmt.Sprintf("RCBO-%05d", r.Intn(90000)+10000)

	status := "Menunggu Konfirmasi"
	if req.Status != "" {
		status = req.Status
	}

	invoiceIDPtr := (*string)(nil)
	if status == "Confirmed" {
		generatedInv := generateInvoiceID()
		invoiceIDPtr = &generatedInv
	}

	paidAmount := int64(0)
	if status == "Confirmed" {
		if req.DPAmount > 0 && req.DPAmount < totalAmount {
			paidAmount = req.DPAmount
		} else {
			paidAmount = totalAmount - req.Discount
		}
	}

	reservation := models.Reservation{
		BookingCode:   bookingCode,
		InvoiceID:     invoiceIDPtr,
		CustomerName:  req.Nama,
		CustomerWA:    req.WA,
		CustomerEmail: req.Email,
		CheckIn:       checkInDate,
		CheckOut:      checkOutDate,
		Nights:        req.Nights,
		PaxAdult:      req.Dewasa,
		PaxChild:      req.Anak,
		TotalAmount:   totalAmount,
		Status:        status,
		PaidAmount:    paidAmount,
		ItemsJSON:     datatypes.JSON(itemsJSONBytes),
		Items:         resItems,
	}

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
	if err := config.DB.Preload("Items").Where("invoice_id = ? OR booking_code = ?", invoiceID, invoiceID).First(&reservation).Error; err != nil {
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
		"paymentAmount": reservation.PaidAmount,
		"items":         reservation.Items,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true, // Added for React CheckReservation.jsx condition
		"data":    response,
	})
}

func GetAllReservations(c *gin.Context) {
	var reservations []models.Reservation
	if err := config.DB.Preload("Items").Order("created_at desc").Find(&reservations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data reservasi"})
		return
	}

	var results []map[string]interface{}
	for _, res := range reservations {
		var itemsData map[string]interface{}
		json.Unmarshal(res.ItemsJSON, &itemsData)
		totalStr, _ := itemsData["totalStr"].(string)
		
		if totalStr == "" && res.TotalAmount > 0 {
			totalStr = formatRupiah(res.TotalAmount)
		}

		area, _ := itemsData["area"].(string)
		
		totalTentsFloat, _ := itemsData["totalTents"].(float64)
		totalTents := int(totalTentsFloat)
		
		paketTextStr, _ := itemsData["paketText"].(string)

		if totalTents == 0 && paketTextStr != "" {
			re := regexp.MustCompile(`(\d+)x`)
			matches := re.FindAllStringSubmatch(paketTextStr, -1)
			for _, m := range matches {
				if len(m) > 1 {
					qty, _ := strconv.Atoi(m[1])
					totalTents += qty
				}
			}
		}
		if totalTents == 0 {
			totalTents = 1
		}
		
		paketText := itemsData["paketText"]
		if len(res.Items) > 0 {
			var pText strings.Builder
			for _, it := range res.Items {
				if it.ItemType == "package" {
					pText.WriteString(fmt.Sprintf("%dx %s\n", it.Quantity, it.ItemName))
				}
			}
			paketText = pText.String()
		}

		results = append(results, map[string]interface{}{
			"id":           res.ID,
			"invoice_id":   res.InvoiceID,
			"booking_code": res.BookingCode,
			"nama":         res.CustomerName,
			"wa":           res.CustomerWA,
			"email":        res.CustomerEmail,
			"checkin":      res.CheckIn.Format("2006-01-02"),
			"checkout":     res.CheckOut.Format("2006-01-02"),
			"status":       res.Status,
			"dateCreated":  res.CreatedAt.Format(time.RFC3339),
			"total":        totalStr,
			"totalAmount":  res.TotalAmount,
			"area":         area,
			"totalTents":   totalTents,
			"paketText":    paketText,
			"addonsText":   itemsData["addonsText"],
			"paymentAmount": res.PaidAmount,
			"pax":          fmt.Sprintf("%d Dewasa, %d Anak", res.PaxAdult, res.PaxChild),
			"dewasa":       res.PaxAdult,
			"anak":         res.PaxChild,
			"nights":       res.Nights,
			"items":        res.Items,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": results,
	})
}

type UpdateStatusRequest struct {
	Status        string      `json:"status"`
	PaymentAmount interface{} `json:"paymentAmount,omitempty"`
	DpAmount      interface{} `json:"dpAmount,omitempty"`
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
		if req.DpAmount != nil && req.DpAmount != "" {
			amtClean := strings.ReplaceAll(fmt.Sprintf("%v", req.DpAmount), "Rp ", "")
			amtClean = strings.ReplaceAll(amtClean, ".", "")
			amt, _ := strconv.ParseInt(amtClean, 10, 64)
			reservation.PaidAmount = amt
		} else if req.PaymentAmount != "" {
			amtClean := strings.ReplaceAll(fmt.Sprintf("%v", req.PaymentAmount), "Rp ", "")
			amtClean = strings.ReplaceAll(amtClean, ".", "")
			amt, _ := strconv.ParseInt(amtClean, 10, 64)
			reservation.PaidAmount = amt
		}
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

func GetCapacity(c *gin.Context) {
	startStr := c.Query("start")
	endStr := c.Query("end")

	if startStr == "" || endStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start dan end parameter diperlukan"})
		return
	}

	startDate, err1 := time.Parse("2006-01-02", startStr)
	endDate, err2 := time.Parse("2006-01-02", endStr)

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal tidak valid"})
		return
	}

	var reservations []models.Reservation
	if err := config.DB.Where("status NOT IN (?, ?) AND check_in < ? AND check_out > ?", "Cancelled", "Rejected", endDate, startDate).Find(&reservations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data reservasi"})
		return
	}

	maxCapacityPerArea := make(map[string]int)

	for d := startDate; d.Before(endDate); d = d.AddDate(0, 0, 1) {
		dailySum := make(map[string]int)
		for _, res := range reservations {
			if !res.CheckIn.After(d) && res.CheckOut.After(d) {
				var itemsData map[string]interface{}
				json.Unmarshal(res.ItemsJSON, &itemsData)
				area, _ := itemsData["area"].(string)
				totalTentsFloat, _ := itemsData["totalTents"].(float64)
				totalTents := int(totalTentsFloat)
				paketTextStr, _ := itemsData["paketText"].(string)
				
				if totalTents == 0 && paketTextStr != "" {
					re := regexp.MustCompile(`(\d+)x`)
					matches := re.FindAllStringSubmatch(paketTextStr, -1)
					for _, m := range matches {
						if len(m) > 1 {
							qty, _ := strconv.Atoi(m[1])
							totalTents += qty
						}
					}
				}
				if totalTents == 0 {
					totalTents = 1
				}

				dailySum[area] += totalTents
			}
		}

		for area, sum := range dailySum {
			if sum > maxCapacityPerArea[area] {
				maxCapacityPerArea[area] = sum
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": maxCapacityPerArea})
}
