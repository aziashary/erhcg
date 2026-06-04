package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IP-based rate limiter
var visitors = make(map[string]*rate.Limiter)
var mtx sync.Mutex

func getVisitor(ip string, limit rate.Limit, burst int) *rate.Limiter {
	mtx.Lock()
	defer mtx.Unlock()

	limiter, exists := visitors[ip]
	if !exists {
		limiter = rate.NewLimiter(limit, burst)
		visitors[ip] = limiter
	}
	return limiter
}

// RateLimit creates a middleware that limits requests
// r: requests per second, b: burst size (max requests at once)
func RateLimit(r rate.Limit, b int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := getVisitor(ip, r, b)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Terlalu banyak request. Harap tunggu sebentar.",
			})
			return
		}

		c.Next()
	}
}
