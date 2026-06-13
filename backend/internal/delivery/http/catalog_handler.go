package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
)

func GetCatalogs(c *gin.Context) {
	var catalogs []models.Catalog
	if err := config.DB.Order("created_at asc").Find(&catalogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch catalogs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": catalogs})
}

func CreateCatalog(c *gin.Context) {
	var input models.Catalog
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create catalog"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Catalog created successfully", "data": input})
}

func UpdateCatalog(c *gin.Context) {
	id := c.Param("id")
	var catalog models.Catalog
	if err := config.DB.First(&catalog, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Catalog not found"})
		return
	}

	if err := c.ShouldBindJSON(&catalog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&catalog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update catalog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Catalog updated successfully", "data": catalog})
}

func DeleteCatalog(c *gin.Context) {
	id := c.Param("id")
	var catalog models.Catalog
	if err := config.DB.First(&catalog, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Catalog not found"})
		return
	}

	if err := config.DB.Delete(&catalog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete catalog"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Catalog deleted successfully"})
}
