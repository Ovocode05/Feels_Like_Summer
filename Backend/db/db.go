package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() error {
	var err error
	DB, err = sql.Open("postgres", os.Getenv("DB_SOURCE"))
	if err != nil {
		return fmt.Errorf("cannot open Db: %w", err)
	}

	if err = DB.PingContext(context.Background()); err != nil {
		return fmt.Errorf("cannot ping Db: %w", err)
	}

	fmt.Println("Connected to the database successfully")
	return nil
}