package com.servesmart.notification.service;

import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.notification.entity.Notification;
import com.servesmart.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Internal method: create a notification for a specific user.
     * Called by other modules (Order, Inventory) — not exposed via API.
     */
    public Notification createNotification(Long userId, Notification.NotificationType type,
                                           String message, String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setRelatedEntityType(entityType);
        notification.setRelatedEntityId(entityId);
        return notificationRepository.save(notification);
    }
}
