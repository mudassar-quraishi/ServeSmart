package com.servesmart.supplier.service;

import com.servesmart.auth.entity.User;
import com.servesmart.auth.repository.UserRepository;
import com.servesmart.inventory.dto.StockAdjustmentRequest;
import com.servesmart.inventory.entity.Ingredient;
import com.servesmart.inventory.repository.IngredientRepository;
import com.servesmart.inventory.service.InventoryService;
import com.servesmart.supplier.dto.CreatePurchaseOrderRequest;
import com.servesmart.supplier.dto.CreateSupplierRequest;
import com.servesmart.supplier.entity.PurchaseOrder;
import com.servesmart.supplier.entity.PurchaseOrderItem;
import com.servesmart.supplier.entity.Supplier;
import com.servesmart.supplier.repository.PurchaseOrderRepository;
import com.servesmart.supplier.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository poRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseOrderRepository poRepository,
                           IngredientRepository ingredientRepository,
                           InventoryService inventoryService,
                           UserRepository userRepository) {
        this.supplierRepository = supplierRepository;
        this.poRepository = poRepository;
        this.ingredientRepository = ingredientRepository;
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    public List<Supplier> listSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier addSupplier(CreateSupplierRequest request) {
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setContactPhone(request.getContactPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(CreatePurchaseOrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + request.getSupplierId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setOrderDate(LocalDate.now());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setCreatedBy(user);
        po.setStatus(PurchaseOrder.PurchaseOrderStatus.PENDING);

        PurchaseOrder savedPo = poRepository.save(po);

        for (CreatePurchaseOrderRequest.POItemRequest itemReq : request.getItems()) {
            Ingredient ingredient = ingredientRepository.findById(itemReq.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found: " + itemReq.getIngredientId()));

            PurchaseOrderItem poItem = new PurchaseOrderItem();
            poItem.setPurchaseOrder(savedPo);
            poItem.setIngredient(ingredient);
            poItem.setQuantity(itemReq.getQuantity());
            poItem.setUnitPrice(itemReq.getUnitPrice());
            savedPo.getItems().add(poItem);
        }

        return poRepository.save(savedPo);
    }

    public List<PurchaseOrder> listPurchaseOrders(Long supplierId, String status) {
        if (supplierId != null && status != null) {
            return poRepository.findBySupplierIdAndStatus(supplierId, PurchaseOrder.PurchaseOrderStatus.valueOf(status));
        } else if (supplierId != null) {
            return poRepository.findBySupplierId(supplierId);
        } else if (status != null) {
            return poRepository.findByStatus(PurchaseOrder.PurchaseOrderStatus.valueOf(status));
        }
        return poRepository.findAll();
    }

    /**
     * Mark a PO as received — increments Inventory stock for each line item.
     */
    @Transactional
    public PurchaseOrder receivePurchaseOrder(Long poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase order not found: " + poId));

        if (po.getStatus() != PurchaseOrder.PurchaseOrderStatus.PENDING) {
            throw new RuntimeException("Purchase order is not PENDING. Current: " + po.getStatus());
        }

        // Increment inventory for each item
        for (PurchaseOrderItem item : po.getItems()) {
            StockAdjustmentRequest stockReq = new StockAdjustmentRequest();
            stockReq.setQuantity(item.getQuantity());
            stockReq.setUnit(item.getIngredient().getBaseUnit().name());
            stockReq.setNote("Purchase order #" + poId + " received");
            inventoryService.stockIn(item.getIngredient().getId(), stockReq);
        }

        po.setStatus(PurchaseOrder.PurchaseOrderStatus.RECEIVED);
        return poRepository.save(po);
    }
}
