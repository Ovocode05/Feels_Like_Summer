package utils

import (
	"fmt"
	"sync"
	"time"
)

// RoadmapRequest represents an in-flight roadmap generation request
type RoadmapRequest struct {
	Result  string
	Error   error
	Done    chan struct{}
	Created time.Time
}

// RequestDeduplicator prevents duplicate concurrent requests
type RequestDeduplicator struct {
	mu       sync.Mutex
	requests map[string]*RoadmapRequest
	timeout  time.Duration
}

var (
	researchDeduplicator  = NewRequestDeduplicator(5 * time.Minute)
	placementDeduplicator = NewRequestDeduplicator(5 * time.Minute)
)

// NewRequestDeduplicator creates a new request deduplicator
func NewRequestDeduplicator(timeout time.Duration) *RequestDeduplicator {
	rd := &RequestDeduplicator{
		requests: make(map[string]*RoadmapRequest),
		timeout:  timeout,
	}
	// Start cleanup goroutine
	go rd.cleanupExpired()
	return rd
}

// GetOrCreate gets an existing request or creates a new one
// Returns (request, isNew) where isNew indicates if this is a new request
func (rd *RequestDeduplicator) GetOrCreate(key string) (*RoadmapRequest, bool) {
	rd.mu.Lock()
	defer rd.mu.Unlock()

	// Check if request already exists
	if req, exists := rd.requests[key]; exists {
		// Check if request is still valid (not timed out)
		if time.Since(req.Created) < rd.timeout {
			return req, false
		}
		// Request timed out, clean it up
		delete(rd.requests, key)
	}

	// Create new request
	req := &RoadmapRequest{
		Done:    make(chan struct{}),
		Created: time.Now(),
	}
	rd.requests[key] = req
	return req, true
}

// Complete marks a request as complete
func (rd *RequestDeduplicator) Complete(key string, result string, err error) {
	rd.mu.Lock()
	defer rd.mu.Unlock()

	if req, exists := rd.requests[key]; exists {
		req.Result = result
		req.Error = err
		close(req.Done)
	}
}

// Remove removes a request from the map (after all waiters have been notified)
func (rd *RequestDeduplicator) Remove(key string) {
	rd.mu.Lock()
	defer rd.mu.Unlock()
	delete(rd.requests, key)
}

// cleanupExpired removes expired requests periodically
func (rd *RequestDeduplicator) cleanupExpired() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rd.mu.Lock()
		now := time.Now()
		for key, req := range rd.requests {
			if now.Sub(req.Created) > rd.timeout {
				delete(rd.requests, key)
			}
		}
		rd.mu.Unlock()
	}
}

// GetResearchDeduplicator returns the global research roadmap deduplicator
func GetResearchDeduplicator() *RequestDeduplicator {
	return researchDeduplicator
}

// GetPlacementDeduplicator returns the global placement roadmap deduplicator
func GetPlacementDeduplicator() *RequestDeduplicator {
	return placementDeduplicator
}

// GenerateRoadmapWithDeduplication generates a roadmap with deduplication
func GenerateRoadmapWithDeduplication(preferenceHash string, generator func() (string, error)) (string, error) {
	dedup := GetResearchDeduplicator()
	key := fmt.Sprintf("research_%s", preferenceHash)

	req, isNew := dedup.GetOrCreate(key)

	if !isNew {
		// Another request is already in progress, wait for it
		println("⏳ Waiting for existing research roadmap generation request:", key)
		<-req.Done
		// Clean up after a short delay to allow other waiters to get the result
		go func() {
			time.Sleep(5 * time.Second)
			dedup.Remove(key)
		}()
		return req.Result, req.Error
	}

	// We're the first request, generate the roadmap
	println("🆕 Starting new research roadmap generation request:", key)
	result, err := generator()
	dedup.Complete(key, result, err)

	// Clean up after a short delay to allow waiters to get the result
	go func() {
		time.Sleep(5 * time.Second)
		dedup.Remove(key)
	}()

	return result, err
}

// GeneratePlacementRoadmapWithDeduplication generates a placement roadmap with deduplication
func GeneratePlacementRoadmapWithDeduplication(preferenceHash string, generator func() (string, error)) (string, error) {
	dedup := GetPlacementDeduplicator()
	key := fmt.Sprintf("placement_%s", preferenceHash)

	req, isNew := dedup.GetOrCreate(key)

	if !isNew {
		// Another request is already in progress, wait for it
		println("⏳ Waiting for existing placement roadmap generation request:", key)
		<-req.Done
		// Clean up after a short delay to allow other waiters to get the result
		go func() {
			time.Sleep(5 * time.Second)
			dedup.Remove(key)
		}()
		return req.Result, req.Error
	}

	// We're the first request, generate the roadmap
	println("🆕 Starting new placement roadmap generation request:", key)
	result, err := generator()
	dedup.Complete(key, result, err)

	// Clean up after a short delay to allow waiters to get the result
	go func() {
		time.Sleep(5 * time.Second)
		dedup.Remove(key)
	}()

	return result, err
}
