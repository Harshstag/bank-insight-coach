def categorize_transaction(merchant: str):
    merchant = merchant.lower()

    categories = {
        "Food": ["zomato", "swiggy", "starbucks", "dominos", "kfc", "mcdonalds", "pizza", "burger", "food", "bakery"],
        "Travel": ["uber", "ola", "rapido", "meru", "ixigo", "makemytrip", "airbnb", "railway", "train", "ride"],
        "Shopping": ["amazon", "flipkart", "noon", "noon.com"],
        "Grocery": ["instamart", "blinkit", "zepto", "big basket", "lbb", "nature's basket", "dmart"],
        "Clothing": ["myntra", "ajio", "uniqlo", "h&m", "forever 21", "zara", "voonik", "myntra"],
        "Entertainment": ["netflix", "amazon prime", "spotify", "bookmyshow", "hotstar", "disney", "gaming", "cinema"],
        "Healthcare": ["apollo", "fortis", "max healthcare", "pharmacy", "medlife", "practo", "medplus", "1mg"],
        "Education": ["udemy", "coursera", "skillshare", "byju", "unacademy", "scaler"],
        "Salary": [
            "salary",
            "payroll",
            "pay day",
            "payout",
            "wage",
            "stipend",
            "salary credit",
            "salary payment",
            "adp",
            "gusto",
            "paychex",
            "workday",
            "rippling",
            "justworks",
            "intuit payroll",
            "ompany", "pvt.", "pvt. ltd.", "ltd."
        ],
        "Utilities": ["electricity", "water", "gas", "postpaid", "mobile", "broadband", "wifi", "dth", "recharge", "airtel", "jio", "idea"],
    }

    for category, keywords in categories.items():
        if any(keyword in merchant for keyword in keywords):
            return category

    return "Others"
