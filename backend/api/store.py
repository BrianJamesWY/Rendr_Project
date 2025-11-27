from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from uuid import uuid4
import os
from database.mongodb import get_db

router = APIRouter(prefix="/store", tags=["store"])

# Pydantic Models
class ProductCreate(BaseModel):
    name: str
    description: str
    price_cents: int
    currency: str = "USD"
    category: str = "merch"  # merch, digital, service
    inventory_count: Optional[int] = None  # None = unlimited
    images: Optional[List[str]] = []
    variants: Optional[List[Dict]] = []  # [{"size": "M", "color": "Black"}]
    shipping_required: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_cents: Optional[int] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    inventory_count: Optional[int] = None
    images: Optional[List[str]] = None
    variants: Optional[List[Dict]] = None
    shipping_required: Optional[bool] = None
    status: Optional[str] = None  # active, inactive, sold_out

class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1
    variant: Optional[Dict] = None

class OrderCreate(BaseModel):
    items: List[Dict]  # [{"product_id", "quantity", "variant"}]
    shipping_address: Dict
    billing_address: Optional[Dict] = None

# Dependency for auth
from api.auth import get_current_user

# ==================== PRODUCTS ====================

@router.post("/products")
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a store product"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        username = current_user.get('username')
        
        product_data = {
            "product_id": str(uuid4()),
            "creator_id": user_id,
            "creator_username": username,
            "name": product.name,
            "description": product.description,
            "price_cents": product.price_cents,
            "currency": product.currency,
            "category": product.category,
            "inventory_count": product.inventory_count,
            "images": product.images or [],
            "variants": product.variants or [],
            "shipping_required": product.shipping_required,
            "sales_count": 0,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.products.insert_one(product_data)
        
        return {
            "success": True,
            "product_id": product_data["product_id"],
            "message": "Product created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products")
async def get_products(
    creator_username: Optional[str] = None,
    category: Optional[str] = None,
    status: str = "active",
    skip: int = 0,
    limit: int = 50,
    db = Depends(get_db)
):
    """Get store products"""
    try:
        query = {"status": status}
        
        if creator_username:
            query["creator_username"] = creator_username
        
        if category:
            query["category"] = category
        
        products = await db.products.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "products": products,
            "count": len(products)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/my")
async def get_my_products(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's products"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        products = await db.products.find(
            {"creator_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "products": products,
            "count": len(products)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    db = Depends(get_db)
):
    """Get a specific product"""
    try:
        product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return product
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a product"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        product = await db.products.find_one({"product_id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this product")
        
        # Build update dict
        update_data = {"updated_at": datetime.now().isoformat()}
        
        for field, value in product_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        await db.products.update_one(
            {"product_id": product_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Product updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a product"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        product = await db.products.find_one({"product_id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this product")
        
        await db.products.delete_one({"product_id": product_id})
        
        return {"success": True, "message": "Product deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SHOPPING CART ====================

@router.post("/cart/add")
async def add_to_cart(
    item: CartItemAdd,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Add item to shopping cart"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check if product exists
        product = await db.products.find_one({"product_id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check if already in cart
        existing_item = await db.cart_items.find_one({
            "user_id": user_id,
            "product_id": item.product_id
        })
        
        if existing_item:
            # Update quantity
            await db.cart_items.update_one(
                {"user_id": user_id, "product_id": item.product_id},
                {"$inc": {"quantity": item.quantity}}
            )
        else:
            # Add new item
            cart_item = {
                "cart_item_id": str(uuid4()),
                "user_id": user_id,
                "product_id": item.product_id,
                "product_name": product.get('name'),
                "product_price_cents": product.get('price_cents'),
                "quantity": item.quantity,
                "variant": item.variant,
                "added_at": datetime.now().isoformat()
            }
            await db.cart_items.insert_one(cart_item)
        
        return {"success": True, "message": "Item added to cart"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cart")
async def get_cart(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user's shopping cart"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        cart_items = await db.cart_items.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        
        # Calculate total
        total_cents = sum(item.get('product_price_cents', 0) * item.get('quantity', 1) for item in cart_items)
        
        return {
            "items": cart_items,
            "item_count": len(cart_items),
            "total_cents": total_cents,
            "total_usd": total_cents / 100
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cart/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Remove item from cart"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        result = await db.cart_items.delete_one({
            "cart_item_id": cart_item_id,
            "user_id": user_id
        })
        
        if result.deleted_count > 0:
            return {"success": True, "message": "Item removed from cart"}
        else:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cart")
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Clear user's cart"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        await db.cart_items.delete_many({"user_id": user_id})
        
        return {"success": True, "message": "Cart cleared"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ORDERS ====================

@router.post("/orders")
async def create_order(
    order: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create an order (checkout)"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Calculate total
        total_cents = 0
        order_items = []
        
        for item in order.items:
            product = await db.products.find_one({"product_id": item["product_id"]})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
            
            item_total = product.get('price_cents', 0) * item.get('quantity', 1)
            total_cents += item_total
            
            order_items.append({
                "product_id": item["product_id"],
                "product_name": product.get('name'),
                "price_cents": product.get('price_cents'),
                "quantity": item.get('quantity', 1),
                "variant": item.get('variant'),
                "subtotal_cents": item_total
            })
        
        # Create order
        order_data = {
            "order_id": str(uuid4()),
            "user_id": user_id,
            "items": order_items,
            "total_cents": total_cents,
            "currency": "USD",
            "shipping_address": order.shipping_address,
            "billing_address": order.billing_address or order.shipping_address,
            "status": "pending_payment",  # pending_payment, paid, shipped, delivered, cancelled
            "payment_intent_id": None,  # Stripe payment intent
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.orders.insert_one(order_data)
        
        # TODO: Create Stripe payment intent
        # For now, just return order details
        
        return {
            "success": True,
            "order_id": order_data["order_id"],
            "total_cents": total_cents,
            "message": "Order created - proceed to payment"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
async def get_orders(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get user's orders"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        orders = await db.orders.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "orders": orders,
            "count": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{order_id}")
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get a specific order"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        order = await db.orders.find_one({
            "order_id": order_id,
            "user_id": user_id
        }, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
