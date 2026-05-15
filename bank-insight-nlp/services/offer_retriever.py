import os
import json
import pandas as pd
from typing import List, Dict

# We'll use a simple keyword-based search as a fallback if Vector DB isn't ready
# In a real production app, this would use ChromaDB or Pinecone.

from datetime import datetime

class OfferRetriever:
    def __init__(self):
        self.offers_path = os.path.join(os.path.dirname(__file__), "..", "data", "offers.json")
        self.offers = self._load_offers()

    def _load_offers(self) -> List[Dict]:
        if not os.path.exists(self.offers_path):
            return []
        try:
            with open(self.offers_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading offers: {e}")
            return []

    def _is_valid(self, offer: Dict) -> bool:
        """Check if the offer is currently valid based on dates."""
        today = datetime.now().date()
        start = offer.get("start_date")
        end = offer.get("end_date")
        
        try:
            if start:
                start_dt = datetime.strptime(start, "%Y-%m-%d").date()
                if today < start_dt:
                    return False
            if end:
                end_dt = datetime.strptime(end, "%Y-%m-%d").date()
                if today > end_dt:
                    return False
        except Exception:
            # If date parsing fails, assume valid but lower confidence
            pass
            
        return True

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Perform a semantic-ish search for offers and product recommendations.
        Supports dual-layer retrieval: time-bound offers and evergreen bank products.
        """
        if not query or not self.offers:
            # Default to high-confidence official bank offers and key products
            defaults = [o for o in self.offers if o.get("source_type") == "official_bank" or o.get("doc_type") == "product_record"]
            return defaults[:top_k] if defaults else self.offers[:top_k]

        query = query.lower()
        query_words = set(query.split())
        
        # Try to extract a potential amount for spend range filtering (e.g., "buy 5000 shoes")
        query_amount = None
        for word in query_words:
            clean_word = "".join(filter(str.isdigit, word))
            if clean_word:
                query_amount = float(clean_word)
                break

        scored_offers = []

        for offer in self.offers:
            # 1. Basic Validity & Spend Range Check
            if offer.get("doc_type") == "offer_record" and not self._is_valid(offer):
                continue
            
            # For product_record, check spend range if amount is present in query
            if offer.get("doc_type") == "product_record" and query_amount is not None:
                min_s = float(offer.get("spend_range_min", 0))
                max_s = float(offer.get("spend_range_max", 999999))
                if not (min_s <= query_amount <= max_s):
                    continue

            score = 0
            
            # 2. Primary Search: retrieval_embedding_text
            embedding_text = offer.get("retrieval_embedding_text", "").lower()
            if not embedding_text:
                embedding_text = f"{offer.get('title')} {offer.get('platform')} {offer.get('description')}".lower()
            
            for word in query_words:
                if word in embedding_text:
                    score += 5
            
            # 3. Intent & Affinity Boosting (The "Upsell" Logic)
            intents = [i.lower() for i in offer.get("intent_types", [])]
            merchants = [m.lower() for m in offer.get("merchant_affinity", [])]
            categories = [c.lower() for c in offer.get("category_affinity", [])]
            rec_queries = [q.lower() for q in offer.get("recommended_for_queries", [])]
            
            # Boost if query matches recommendation trigger words or affinity
            for word in query_words:
                if any(word in i for i in intents): score += 4
                if any(word in m for m in merchants): score += 6 # Merchant affinity is very strong
                if any(word in c for c in categories): score += 4
                if any(word in q for q in rec_queries): score += 3

            # 4. Source & Priority Ranking
            if score > 0:
                # Prioritize products enabled for upsell if there's a match
                if offer.get("doc_type") == "product_record" and offer.get("upsell_enabled"):
                    score += (10 * offer.get("upsell_priority", 1))
                
                # Source ranking
                source_type = offer.get("source_type", "")
                if source_type == "official_bank": score += 10
                elif source_type == "official_merchant": score += 7
                
                if offer.get("confidence") == "high": score += 5
                elif offer.get("confidence") == "low": score -= 5

            if score > 0:
                scored_offers.append((score, offer))

        # Sort by score descending
        scored_offers.sort(key=lambda x: x[0], reverse=True)
        
        # Deduplication & Hybrid Selection (Balanced mix of offers and products)
        seen_keys = set()
        final_results = []
        
        # Ensure we don't just return one type if both are available
        for score, offer in scored_offers:
            dedup_key = f"{offer.get('platform')}|{offer.get('bank_or_merchant')}|{offer.get('offer_type')}|{offer.get('title')}"
            if dedup_key not in seen_keys:
                final_results.append(offer)
                seen_keys.add(dedup_key)
            
            if len(final_results) >= top_k:
                break
            
        return final_results

# Singleton instance
retriever = OfferRetriever()

def get_relevant_offers(query: str) -> List[Dict]:
    return retriever.search(query)
