package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func Generateuid() (string, error) {
	bytes := make([]byte, 6) // 6 bytes = 12 hex characters
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
