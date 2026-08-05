package com.servesmart.billing.service;

import com.servesmart.billing.dto.CreateBillRequest;
import com.servesmart.billing.dto.RecordPaymentRequest;
import com.servesmart.billing.entity.Bill;
import com.servesmart.billing.entity.Payment;
import com.servesmart.billing.repository.BillRepository;
import com.servesmart.billing.repository.PaymentRepository;
import com.servesmart.menu.entity.MenuItem;
import com.servesmart.menu.service.MenuService;
import com.servesmart.order.entity.Order;
import com.servesmart.order.entity.OrderItem;
import com.servesmart.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final MenuService menuService;
    private static final AtomicLong invoiceCounter = new AtomicLong(1000);

    public BillingService(BillRepository billRepository, PaymentRepository paymentRepository,
                          OrderRepository orderRepository, MenuService menuService) {
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.menuService = menuService;
    }

    @Transactional
    public List<Bill> createBill(CreateBillRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        if (!"COMPLETED".equals(order.getStatus()) && !"SERVED".equals(order.getStatus())) {
            throw new RuntimeException("Order must be COMPLETED or SERVED to generate a bill. Current: " + order.getStatus());
        }

        // Calculate subtotal and GST using real prices from order items + per-item GST slabs
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal gstAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Get the GST slab from the menu item for accurate tax
            try {
                MenuItem menuItem = menuService.getItemById(item.getMenuItemId());
                BigDecimal itemGst = itemTotal.multiply(menuItem.getGstSlab().getRate()).setScale(2, RoundingMode.HALF_UP);
                gstAmount = gstAmount.add(itemGst);
            } catch (Exception e) {
                // Fallback to 5% if menu item lookup fails
                gstAmount = gstAmount.add(itemTotal.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP));
            }
        }

        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        List<Bill> bills = new ArrayList<>();

        if (request.getSplit() != null && !request.getSplit().isEmpty()) {
            // Split billing
            String splitGroupId = UUID.randomUUID().toString();
            BigDecimal totalBeforeDiscount = subtotal.add(gstAmount).subtract(discount);

            for (CreateBillRequest.SplitEntry entry : request.getSplit()) {
                BigDecimal ratio = entry.getAmount().divide(totalBeforeDiscount, 4, RoundingMode.HALF_UP);
                Bill bill = new Bill();
                bill.setOrderId(order.getId());
                bill.setInvoiceNumber(generateInvoiceNumber());
                bill.setSubtotal(subtotal.multiply(ratio).setScale(2, RoundingMode.HALF_UP));
                bill.setGstAmount(gstAmount.multiply(ratio).setScale(2, RoundingMode.HALF_UP));
                bill.setDiscountAmount(discount.multiply(ratio).setScale(2, RoundingMode.HALF_UP));
                bill.setTotalAmount(entry.getAmount());
                bill.setSplitGroupId(splitGroupId);
                bills.add(billRepository.save(bill));
            }
        } else {
            // Single bill
            Bill bill = new Bill();
            bill.setOrderId(order.getId());
            bill.setInvoiceNumber(generateInvoiceNumber());
            bill.setSubtotal(subtotal);
            bill.setGstAmount(gstAmount);
            bill.setDiscountAmount(discount);
            bill.setTotalAmount(subtotal.add(gstAmount).subtract(discount));
            bills.add(billRepository.save(bill));
        }

        return bills;
    }

    public Bill getBill(Long billId) {
        return billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found: " + billId));
    }

    @Transactional
    public Payment recordPayment(Long billId, RecordPaymentRequest request) {
        Bill bill = getBill(billId);

        BigDecimal alreadyPaid = paymentRepository.sumPaymentsByBillId(billId);
        BigDecimal newTotal = alreadyPaid.add(request.getAmount());

        if (newTotal.compareTo(bill.getTotalAmount()) > 0) {
            throw new RuntimeException("Payment of " + request.getAmount() +
                    " would exceed bill total. Remaining: " + bill.getTotalAmount().subtract(alreadyPaid));
        }

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setPaymentMode(Payment.PaymentMode.valueOf(request.getPaymentMode().toUpperCase()));
        payment.setAmount(request.getAmount());

        return paymentRepository.save(payment);
    }

    /**
     * Generate a simple printable receipt (as a formatted string).
     */
    public String getReceipt(Long billId) {
        Bill bill = getBill(billId);
        BigDecimal paid = paymentRepository.sumPaymentsByBillId(billId);
        BigDecimal remaining = bill.getTotalAmount().subtract(paid);

        StringBuilder sb = new StringBuilder();
        sb.append("═══════════════════════════════\n");
        sb.append("        SERVESMART ERP\n");
        sb.append("═══════════════════════════════\n");
        sb.append("Invoice: ").append(bill.getInvoiceNumber()).append("\n");
        sb.append("Order #: ").append(bill.getOrderId()).append("\n");
        sb.append("───────────────────────────────\n");
        sb.append(String.format("Subtotal:     ₹ %10.2f\n", bill.getSubtotal()));
        sb.append(String.format("GST:          ₹ %10.2f\n", bill.getGstAmount()));
        sb.append(String.format("Discount:     ₹ %10.2f\n", bill.getDiscountAmount()));
        sb.append("───────────────────────────────\n");
        sb.append(String.format("TOTAL:        ₹ %10.2f\n", bill.getTotalAmount()));
        sb.append(String.format("Paid:         ₹ %10.2f\n", paid));
        sb.append(String.format("Remaining:    ₹ %10.2f\n", remaining));
        sb.append("═══════════════════════════════\n");
        sb.append("      Thank you! Visit again.\n");

        return sb.toString();
    }

    private String generateInvoiceNumber() {
        return "INV-2026-" + String.format("%06d", invoiceCounter.incrementAndGet());
    }
}
