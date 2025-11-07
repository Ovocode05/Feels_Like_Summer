package utils

import (
	"fmt"
	"sync"
	"time"
)

// UserRateLimiter tracks last request time per user to prevent spam
type UserRateLimiter struct {
	mu            sync.Mutex
	lastRequests  map[string]time.Time
	cooldown      time.Duration
	cleanupTicker *time.Ticker
}

var (
	roadmapRateLimiter = NewUserRateLimiter(10 * time.Second) // 10 seconds cooldown between requests
)

// NewUserRateLimiter creates a new rate limiter
func NewUserRateLimiter(cooldown time.Duration) *UserRateLimiter {
	rl := &UserRateLimiter{
		lastRequests: make(map[string]time.Time),
		cooldown:     cooldown,
	}
	// Start cleanup goroutine
	rl.cleanupTicker = time.NewTicker(1 * time.Minute)
	go rl.cleanupOldEntries()
	return rl
}

// AllowRequest checks if a user is allowed to make a request
// Returns (allowed, secondsUntilAllowed)
func (rl *UserRateLimiter) AllowRequest(userID string, requestType string) (bool, int) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	key := fmt.Sprintf("%s_%s", userID, requestType)
	now := time.Now()

	if lastTime, exists := rl.lastRequests[key]; exists {
		timeSince := now.Sub(lastTime)
		if timeSince < rl.cooldown {
			secondsLeft := int(rl.cooldown.Seconds() - timeSince.Seconds())
			return false, secondsLeft
		}
	}

	rl.lastRequests[key] = now
	return true, 0
}

// cleanupOldEntries removes entries older than the cooldown period
func (rl *UserRateLimiter) cleanupOldEntries() {
	for range rl.cleanupTicker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, lastTime := range rl.lastRequests {
			if now.Sub(lastTime) > rl.cooldown*2 {
				delete(rl.lastRequests, key)
			}
		}
		rl.mu.Unlock()
	}
}

// GetRoadmapRateLimiter returns the global roadmap rate limiter
func GetRoadmapRateLimiter() *UserRateLimiter {
	return roadmapRateLimiter
}
