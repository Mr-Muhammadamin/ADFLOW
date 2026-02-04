import stripe
from app.core.config import settings
from typing import Optional

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    
    @staticmethod
    def create_payment_intent(amount: float, customer_id: Optional[str] = None) -> tuple[str, str]:
        amount_cents = int(amount * 100)
        
        intent_params = {
            "amount": amount_cents,
            "currency": "usd",
            "metadata": {"purpose": "wallet_deposit"}
        }
        
        if customer_id:
            intent_params["customer"] = customer_id
        
        intent = stripe.PaymentIntent.create(**intent_params)
        return intent.client_secret, intent.id
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> str:
        customer = stripe.Customer.create(
            email=email,
            name=name or email
        )
        return customer.id
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id: str) -> dict:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return intent
