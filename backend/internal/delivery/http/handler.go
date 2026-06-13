package http

import (
	"net/http"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// --- Settings ---

func GetSettings(c *gin.Context) {
	var settings []models.Setting
	if err := config.DB.Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch settings"})
		return
	}

	// Convert to key-value map for easier frontend consumption
	settingsMap := make(map[string]string)
	for _, s := range settings {
		settingsMap[s.Key] = s.Value
	}

	c.JSON(http.StatusOK, gin.H{"data": settingsMap})
}

type UpdateSettingRequest struct {
	Value string `json:"value"`
}

func UpdateSettings(c *gin.Context) {
	key := c.Param("key")
	var req UpdateSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setting := models.Setting{Key: key, Value: req.Value}
	if err := config.DB.Save(&setting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Setting updated successfully", "data": setting})
}
