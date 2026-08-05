package com.servesmart.feedback.service;

import com.servesmart.feedback.dto.SubmitFeedbackRequest;
import com.servesmart.feedback.entity.Feedback;
import com.servesmart.feedback.repository.FeedbackRepository;
import com.servesmart.order.entity.Order;
import com.servesmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final OrderRepository orderRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, OrderRepository orderRepository) {
        this.feedbackRepository = feedbackRepository;
        this.orderRepository = orderRepository;
    }

    public Feedback submit(SubmitFeedbackRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        if (!"COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("Feedback can only be submitted for completed orders");
        }

        Feedback feedback = new Feedback();
        feedback.setOrder(order);
        feedback.setCustomer(order.getCustomer());
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> list(LocalDate from, LocalDate to) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt = to != null ? to.atTime(23, 59, 59) : null;
        return feedbackRepository.findByDateRange(fromDt, toDt);
    }
}
