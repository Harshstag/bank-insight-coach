def generate_nlp_notification(signals):
    notifications = []
    categories = signals.get("categories", {})
    most_recent_category = signals.get("most_recent_category")
    
    # Check each category for significant spikes
    for category, data in categories.items():
        spike_percent = data.get("spike_percent", 0)
        weekly_spend = data.get("weekly_spend", 0)
        percentage_of_total = data.get("percentage_of_total", 0)
        
        # High spike (>40%)
        if spike_percent > 40 and weekly_spend > 0:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "WARNING",
                "title": f"High {category} Spending",
                "message": f"You spent {spike_percent}% more on {category} this week (₹{weekly_spend:.2f}).",
                "confidence": "HIGH",
                "category": category,
                "spike_percent": spike_percent,
                "weekly_spend": weekly_spend
            })
        # Moderate spike (20-40%)
        elif spike_percent > 20 and weekly_spend > 0:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": f"{category} Spending Increase",
                "message": f"Your {category} spending increased by {spike_percent}% this week (₹{weekly_spend:.2f}).",
                "confidence": "MEDIUM",
                "category": category,
                "spike_percent": spike_percent,
                "weekly_spend": weekly_spend
            })
        
        # Category dominates total spending (>50%)
        if percentage_of_total > 50:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": f"{category} Dominates Spending",
                "message": f"{category} accounts for {percentage_of_total}% of your total spending this week.",
                "confidence": "HIGH",
                "category": category,
                "percentage": percentage_of_total,
                "weekly_spend": weekly_spend
            })
    
    # Check overall spending patterns
    weekly_avg = signals.get("weekly_avg", 0)
    total_weekly = signals.get("total_weekly_spend", 0)
    
    if total_weekly > weekly_avg * 1.3 and weekly_avg > 0:
        notifications.append({
            "mode": "RULE_BASED",
            "severity": "WARNING",
            "title": "Overall Spending Alert",
            "message": f"Your total spending is 30% higher than usual this week (₹{total_weekly:.2f}).",
            "confidence": "HIGH",
            "category": "Overall",
            "weekly_spend": 0
        })
    elif total_weekly > weekly_avg * 1.1 and weekly_avg > 0:
        notifications.append({
            "mode": "RULE_BASED",
            "severity": "INFO",
            "title": "Spending Update",
            "message": f"Your spending is slightly higher than usual this week (₹{total_weekly:.2f}).",
            "confidence": "MEDIUM",
            "category": "Overall",
            "weekly_spend": 0
        })
    
    # Return the most critical notification or a default one
    if notifications:
        # Sort by: most recent category first, then severity (WARNING first), then weekly_spend (higher first)
        notifications.sort(key=lambda x: (
            x.get("category") != most_recent_category,
            x["severity"] != "WARNING",
            -x.get("weekly_spend", 0)
        ))
        return notifications[0]  # Return the most critical notification
    
    return {
        "mode": "RULE_BASED",
        "severity": "INFO",
        "title": "All Good",
        "message": "Your spending is under control this week.",
        "confidence": "LOW",
        "category": "Overall"
    }
