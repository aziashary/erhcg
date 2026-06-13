package http

import (
	"net/http"

	"github.com/aziashary/erhcg/backend/internal/config"
	"github.com/aziashary/erhcg/backend/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password"` // Opsional saat update
	Role     string `json:"role" binding:"required"`
}

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Order("created_at asc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data user"})
		return
	}

	// Jangan kembalikan password hash
	var result []map[string]interface{}
	for _, u := range users {
		result = append(result, map[string]interface{}{
			"id":         u.ID,
			"username":   u.Username,
			"role":       u.Role,
			"created_at": u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

func CreateUser(c *gin.Context) {
	var req UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	if req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password wajib diisi"})
		return
	}

	// Cek apakah username sudah ada
	var existing models.User
	if err := config.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username sudah digunakan"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	user := models.User{
		Username:     req.Username,
		PasswordHash: string(hash),
		Role:         req.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dibuat", "id": user.ID})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format request tidak valid"})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Cek duplikasi username jika username diubah
	if req.Username != user.Username {
		var existing models.User
		if err := config.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username sudah digunakan oleh user lain"})
			return
		}
		user.Username = req.Username
	}

	user.Role = req.Role

	if req.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
			return
		}
		user.PasswordHash = string(hash)
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil diupdate"})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	// Cegah hapus diri sendiri jika perlu (bisa ditambahkan pengecekan token)
	
	if err := config.DB.Where("id = ?", id).Delete(&models.User{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dihapus"})
}
