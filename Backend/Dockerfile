## Multi-stage build for Go backend

# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build deps
RUN apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# Cache go mods first
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . ./

# Build
RUN CGO_ENABLED=0 go build -o server ./main.go

# Runtime stage
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
ENV TZ=UTC

COPY .env ./.env
# Copy binary
COPY --from=builder /app/server /app/server

# Copy .env at runtime via compose; still allow defaults if present

EXPOSE 8080

USER 65532:65532

ENTRYPOINT ["/app/server"]

