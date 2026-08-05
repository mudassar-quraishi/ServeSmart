package com.servesmart.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex, WebRequest request) {
        String message = ex.getMessage();

        if (message != null && message.contains("Account is locked")) {
            return buildError(HttpStatus.LOCKED, "ACCOUNT_LOCKED", message, request);
        }
        if (message != null && message.contains("Invalid credentials")) {
            return buildError(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", message, request);
        }
        if (message != null && message.contains("not found")) {
            return buildError(HttpStatus.NOT_FOUND, "NOT_FOUND", message, request);
        }
        if (message != null && (message.contains("already exists") || message.contains("CONFLICT") || message.contains("Invalid status transition") || message.contains("overlapping"))) {
            return buildError(HttpStatus.CONFLICT, "CONFLICT", message, request);
        }
        if (message != null && (message.contains("Insufficient") || message.contains("exceed") || message.contains("Only managers"))) {
            return buildError(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message, request);
        }

        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", message, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return buildError(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message, request);
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(jakarta.persistence.EntityNotFoundException ex, WebRequest request) {
        return buildError(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), request);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex, WebRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "You do not have permission to access this resource", request);
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String error, String message, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("path", request.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(status).body(body);
    }
}
