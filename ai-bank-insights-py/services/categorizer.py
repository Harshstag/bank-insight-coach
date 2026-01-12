
import re

def normalize_text(text: str):
    if not text:
        return ""
    text = text.lower().strip()

    # common spelling corrections
    corrections = {
        "grocerie": "grocery",
        "groceri": "grocery",
        "restuarant": "restaurant",
        "restraunt": "restaurant"
    }

    for wrong, correct in corrections.items():
        text = text.replace(wrong, correct)

    # remove multiple spaces, punctuation
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text



def _find_category(text: str, categories: dict) -> str:
    text = normalize_text(text)

    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in text:
                return category

    return None


def categorize_transaction(description: str = "", merchant: str = ""):
    desc = (description or "").lower()
    merch = (merchant or "").lower()

    
    # Define categories with their keywords (order matters - more specific first)
    categories = {
        # Investments via brokers and platforms
        "Investment": [
            # Indian brokers/platforms
            "zerodha", "groww", "upstox", "angel one", "angelone", "hdfc securities",
            "icici direct", "kotak securities", "sharekhan", "5paisa", "motilal oswal",
            "sbismart", "axis direct", "edelweiss", "paytm money",
            # Generic investment terms
            "broker", "demat", "equity", "stock", "ipo", "investment", "buy order",
            "delivery trade", "intraday",
        ],

        # Systematic Investment Plans (recurring MF debits)
        "SIP": [
            # Explicit SIP terms
            "sip", "systematic investment plan", "monthly sip", "auto sip", "mf sip",
            # MF platforms commonly used for SIPs
            "coin", "groww sip", "paytm money", "kuvera", "et money", "clearfunds",
            # AMC / Mutual fund houses
            "hdfc mutual fund", "sbi mutual fund", "icici prudential", "nippon india",
            "axis mutual fund", "kotak mutual fund", "uti mutual fund", "mirae asset",
            "canara robeco", "aditya birla sun life",
            # Generic MF terms
            "mutual fund", "nav purchase", "sip debit",
        ],

        # Loan EMIs and instalments
        "EMI": [
            # Explicit EMI words/variants - MOST SPECIFIC FIRST
            "loan emi", "emi", "loan repayment", "equated monthly instalment",
            "equated monthly installment", "instalment", "installment", "e.m.i",
            # Loan types (specific)
            "home loan emi", "car loan emi", "vehicle loan emi", "education loan emi",
            "personal loan emi", "bike loan emi", "two wheeler loan emi",
            "home loan", "car loan", "vehicle loan", "education loan",
            "personal loan", "bike loan", "two wheeler loan",
            "credit card emi", "no cost emi",
            # NBFCs/Lenders (keep only non-bank finance companies to avoid conflicts)
            "bajaj finance", "tata capital", "mahindra finance", "tvs credit", 
            "home credit", "fullerton", "muthoot finance", "shriram finance",
        ],
        "Food": [
            # Specific brands first
            "zomato", "swiggy", "ubereats", "starbucks", "dominos", "kfc", 
            "mcdonalds", "burger king", "subway", "pizza hut", "foodpanda",
            "cafe coffee day", "chaayos", "barista",
            # Generic food terms
            "food", "pizza", "burger", "sandwich", "breakfast", "lunch", "dinner",
            "coffee", "tea", "meal", "restaurant", "cafe", "bakery", "snack",
            "eat", "dining", "takeaway"
        ],
        
        "Travel": [
            # Ride services
            "uber", "ola", "rapido", "meru",
            # Travel booking
            "makemytrip", "goibigo", "yatra", "cleartrip", "airbnb", "ixigo",
            # Travel terms
            "ride", "cab", "taxi", "train", "flight", "railway", 
            "hotel", "travel", "trip", "bus", "metro", "petrol", "diesel", "fuel"
        ],
        
        "Clothing": [
            # Fashion brands/platforms
            "myntra", "ajio", "h&m", "zara", "uniqlo", "forever 21",
            "shein", "lifestyle", "westside", "pantaloons", "nykaa fashion",
            # Clothing terms
            "clothing", "clothes", "fashion", "shoes", "footwear", "sneakers",
            "dress", "shirt", "jeans", "apparel", "wear", "garment", "outfit"
        ],
        
        "Grocery": [
            # Grocery delivery services
            "instamart", "blinkit", "zepto", "dunzo", "bigbasket", "big basket",
            "grofers", "jiomart", "amazon fresh",
            # Stores
            "dmart", "reliance fresh", "more", "star bazaar",
            # Grocery terms
            "grocery", "groceries", "supermarket", "vegetables", "fruits",
            "milk", "bread", "provisions"
        ],
        
        "Entertainment": [
            # Streaming platforms (specific names)
            "netflix", "hotstar", "amazon prime", "prime video", "disney",
            "spotify", "youtube", "apple music", "gaana", "wynk",
            # Entertainment venues
            "bookmyshow", "pvr", "inox",
            # Entertainment terms
            "movie", "cinema", "theatre", "gaming", "game", "concert",
            "entertainment", "show", "tickets", "event"
        ],
        
        "Healthcare": [
            # Hospitals
            "apollo", "fortis", "max", "manipal", "medanta", "aiims",
            # Pharmacies
            "pharmacy", "medlife", "practo", "1mg", "netmeds", "pharmeasy", "medplus",
            # Healthcare terms
            "hospital", "clinic", "doctor", "medical", "medicine", "health",
            "consultation", "checkup", "treatment", "diagnostic", "lab", "test"
        ],
        
        "Education": [
            # Learning platforms
            "udemy", "coursera", "skillshare", "byju", "unacademy", 
            "vedantu", "toppr", "scaler", "linkedin learning",
            # Education terms
            "course", "education", "learning", "training", "tuition",
            "school", "college", "university", "study", "books"
        ],
        
        "Utilities": [
            # Utility providers
            "electricity board", "municipal corporation", "bescom",
            "airtel", "jio", "vodafone", "idea", "bsnl",
            # Utility terms
            "electricity", "electric", "power", "water", "gas", "lpg",
            "bill", "mobile", "recharge", "broadband", "wifi", 
            "internet", "fiber", "postpaid", "prepaid"
        ],
        
        "Shopping": [
            # E-commerce platforms (general shopping)
            "amazon", "flipkart", "noon", "meesho", "snapdeal",
            # Shopping terms
            "shopping", "purchase", "buy",
        ],
        
        "Salary": [
            "salary", "payroll", "wage", "stipend", "income", "earnings",
            "company", "pvt", "ltd", "corporation"
        ]
    }
    
    # ---------- RULE 1: DESCRIPTION FIRST ----------
    for category, keywords in categories.items():
        if any(k in desc for k in keywords):
            return category

    # ---------- RULE 2: MERCHANT FALLBACK ----------
    for category, keywords in categories.items():
        if any(k in merch for k in keywords):
            return category
    
    # STEP 3: No match found anywhere
    return "Others"
