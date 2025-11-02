package utils

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strconv"
	"strings"
)

// EmailConfig holds the configuration for email sending
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
	UseTLS       bool
}

// EmailMessage represents an email to be sent
type EmailMessage struct {
	To      []string
	Subject string
	Body    string
	IsHTML  bool
}

// LoadEmailConfig loads email configuration from environment variables
func LoadEmailConfig() *EmailConfig {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	useTLS := os.Getenv("SMTP_USE_TLS") == "true"

	return &EmailConfig{
		SMTPHost:     os.Getenv("SMTP_HOST"),
		SMTPPort:     port,
		SMTPUsername: os.Getenv("SMTP_USERNAME"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		FromEmail:    os.Getenv("SMTP_FROM_EMAIL"),
		FromName:     os.Getenv("SMTP_FROM_NAME"),
		UseTLS:       useTLS,
	}
}

// SendEmail sends an email using the configured SMTP server
func SendEmail(config *EmailConfig, message *EmailMessage) error {
	if config.SMTPHost == "" || config.SMTPPort == 0 {
		return fmt.Errorf("SMTP configuration is incomplete")
	}

	if len(message.To) == 0 {
		return fmt.Errorf("no recipients specified")
	}

	// Build the email headers and body
	from := config.FromEmail
	if config.FromName != "" {
		from = fmt.Sprintf("%s <%s>", config.FromName, config.FromEmail)
	}

	contentType := "text/plain; charset=UTF-8"
	if message.IsHTML {
		contentType = "text/html; charset=UTF-8"
	}

	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = strings.Join(message.To, ", ")
	headers["Subject"] = message.Subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = contentType

	// Build the message
	var emailBody strings.Builder
	for key, value := range headers {
		emailBody.WriteString(fmt.Sprintf("%s: %s\r\n", key, value))
	}
	emailBody.WriteString("\r\n")
	emailBody.WriteString(message.Body)

	// Determine authentication method
	auth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPHost)
	addr := fmt.Sprintf("%s:%d", config.SMTPHost, config.SMTPPort)

	// Send email based on TLS configuration
	if config.UseTLS {
		return sendEmailTLS(addr, auth, config.FromEmail, message.To, []byte(emailBody.String()))
	}

	return smtp.SendMail(addr, auth, config.FromEmail, message.To, []byte(emailBody.String()))
}

// sendEmailTLS sends email using explicit TLS connection (STARTTLS)
func sendEmailTLS(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	// Connect to the SMTP server
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("failed to connect to SMTP server: %w", err)
	}
	defer client.Close()

	// Start TLS
	host := strings.Split(addr, ":")[0]
	tlsConfig := &tls.Config{
		ServerName:         host,
		InsecureSkipVerify: false,
	}

	if err = client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("failed to start TLS: %w", err)
	}

	// Authenticate
	if auth != nil {
		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("authentication failed: %w", err)
		}
	}

	// Set sender
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("failed to set sender: %w", err)
	}

	// Set recipients
	for _, recipient := range to {
		if err = client.Rcpt(recipient); err != nil {
			return fmt.Errorf("failed to set recipient %s: %w", recipient, err)
		}
	}

	// Send the email body
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("failed to send DATA command: %w", err)
	}

	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("failed to write message: %w", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("failed to close message writer: %w", err)
	}

	return client.Quit()
}

// SendVerificationEmail sends an email verification email
func SendVerificationEmail(config *EmailConfig, toEmail, verificationToken string) error {
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", os.Getenv("FRONTEND_URL"), verificationToken)

	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Email Verification</h2>
			<p>Thank you for registering! Please verify your email address by clicking the link below:</p>
			<p><a href="%s">Verify Email</a></p>
			<p>Or copy and paste this link in your browser:</p>
			<p>%s</p>
			<p>This link will expire in 24 hours.</p>
			<p>If you didn't create an account, please ignore this email.</p>
		</body>
		</html>
	`, verificationURL, verificationURL)

	message := &EmailMessage{
		To:      []string{toEmail},
		Subject: "Verify Your Email Address",
		Body:    body,
		IsHTML:  true,
	}

	return SendEmail(config, message)
}

// SendPasswordResetEmail sends a password reset email
func SendPasswordResetEmail(config *EmailConfig, toEmail, resetToken string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), resetToken)

	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Password Reset Request</h2>
			<p>You requested to reset your password. Click the link below to reset it:</p>
			<p><a href="%s">Reset Password</a></p>
			<p>Or copy and paste this link in your browser:</p>
			<p>%s</p>
			<p>This link will expire in 1 hour.</p>
			<p>If you didn't request a password reset, please ignore this email.</p>
		</body>
		</html>
	`, resetURL, resetURL)

	message := &EmailMessage{
		To:      []string{toEmail},
		Subject: "Password Reset Request",
		Body:    body,
		IsHTML:  true,
	}

	return SendEmail(config, message)
}

// SendProjectApplicationEmail sends a notification email when someone applies to a project
func SendProjectApplicationEmail(config *EmailConfig, toEmail, projectTitle, applicantName string) error {
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>New Project Application</h2>
			<p>You have received a new application for your project: <strong>%s</strong></p>
			<p>Applicant: %s</p>
			<p>Please log in to your dashboard to review the application.</p>
		</body>
		</html>
	`, projectTitle, applicantName)

	message := &EmailMessage{
		To:      []string{toEmail},
		Subject: fmt.Sprintf("New Application for %s", projectTitle),
		Body:    body,
		IsHTML:  true,
	}

	return SendEmail(config, message)
}

// SendWelcomeEmail sends a welcome email after successful registration
func SendWelcomeEmail(config *EmailConfig, toEmail, name string) error {
	body := fmt.Sprintf(`
		<html>
		<body>
			<h2>Welcome to Feels Like Summer!</h2>
			<p>Hi %s,</p>
			<p>Thank you for joining our platform. We're excited to have you here!</p>
			<p>Get started by exploring projects or creating your own.</p>
			<p>If you have any questions, feel free to reach out to our support team.</p>
		</body>
		</html>
	`, name)

	message := &EmailMessage{
		To:      []string{toEmail},
		Subject: "Welcome to Feels Like Summer!",
		Body:    body,
		IsHTML:  true,
	}

	return SendEmail(config, message)
}
