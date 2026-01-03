def generate_nlp_notification(signals):
    """
    Generate precise NLP notifications with comprehensive edge case handling.
    
    Args:
        signals: Dictionary containing transaction signals and spending patterns
        
    Returns:
        Dict containing the most relevant notification
    """
    # Input validation
    if not signals or not isinstance(signals, dict):
        return _create_default_notification("Invalid data provided")
    
    notifications = []
    categories = signals.get("categories", {})
    most_recent_category = signals.get("most_recent_category")
    
    # Minimum thresholds to avoid noise from trivial amounts
    MIN_AMOUNT_THRESHOLD = 10  # Minimum ₹10 to trigger notifications
    MIN_SPIKE_AMOUNT = 50  # Minimum ₹50 increase to report spikes
    
    # Edge case: No categories data
    if not categories:
        return _create_default_notification("No spending data available")
    
    # Process each category with robust validation
    for category, data in categories.items():
        if not isinstance(data, dict):
            continue  # Skip malformed data
            
        # Safely extract values with type validation
        spike_percent = _safe_float(data.get("spike_percent", 0))
        weekly_spend = _safe_float(data.get("weekly_spend", 0))
        percentage_of_total = _safe_float(data.get("percentage_of_total", 0))
        weekly_avg = _safe_float(data.get("weekly_avg", 0))
        
        # Skip if spending is below minimum threshold
        if weekly_spend < MIN_AMOUNT_THRESHOLD:
            continue
        
        # Calculate actual amount increase for context
        amount_increase = weekly_spend - weekly_avg
        
        # Critical spike (>50% increase and significant amount)
        if spike_percent > 50 and amount_increase > MIN_SPIKE_AMOUNT:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "CRITICAL",
                "title": f"Critical {category} Spending Spike",
                "message": f"Your {category} spending surged by {spike_percent:.1f}% (₹{amount_increase:.2f} more than usual). Weekly total: ₹{weekly_spend:.2f}.",
                "confidence": "HIGH",
                "category": category,
                "spike_percent": spike_percent,
                "weekly_spend": weekly_spend,
                "priority": 1
            })
        # High spike (40-50%)
        elif spike_percent > 40 and amount_increase > MIN_SPIKE_AMOUNT:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "WARNING",
                "title": f"High {category} Spending",
                "message": f"You spent {spike_percent:.1f}% more on {category} this week (₹{weekly_spend:.2f}, up ₹{amount_increase:.2f}).",
                "confidence": "HIGH",
                "category": category,
                "spike_percent": spike_percent,
                "weekly_spend": weekly_spend,
                "priority": 2
            })
        # Moderate spike (25-40%)
        elif spike_percent > 25 and amount_increase > MIN_SPIKE_AMOUNT:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": f"{category} Spending Increase",
                "message": f"Your {category} spending increased by {spike_percent:.1f}% this week (₹{weekly_spend:.2f}).",
                "confidence": "MEDIUM",
                "category": category,
                "spike_percent": spike_percent,
                "weekly_spend": weekly_spend,
                "priority": 3
            })
        
        # Category dominates total spending (>60% for high severity, >50% for info)
        if percentage_of_total > 60 and weekly_spend > MIN_AMOUNT_THRESHOLD:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "WARNING",
                "title": f"{category} Heavily Dominates Budget",
                "message": f"{category} represents {percentage_of_total:.1f}% of your total spending this week (₹{weekly_spend:.2f}).",
                "confidence": "HIGH",
                "category": category,
                "percentage": percentage_of_total,
                "weekly_spend": weekly_spend,
                "priority": 2
            })
        elif percentage_of_total > 50 and weekly_spend > MIN_AMOUNT_THRESHOLD:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": f"{category} Dominates Spending",
                "message": f"{category} accounts for {percentage_of_total:.1f}% of your total spending this week (₹{weekly_spend:.2f}).",
                "confidence": "HIGH",
                "category": category,
                "percentage": percentage_of_total,
                "weekly_spend": weekly_spend,
                "priority": 3
            })
    
    # Check overall spending patterns with validation
    weekly_avg = _safe_float(signals.get("weekly_avg", 0))
    total_weekly = _safe_float(signals.get("total_weekly_spend", 0))
    
    # Only generate overall alerts if we have baseline data
    if weekly_avg > 0 and total_weekly > MIN_AMOUNT_THRESHOLD:
        overall_increase = total_weekly - weekly_avg
        overall_percent = ((total_weekly - weekly_avg) / weekly_avg) * 100
        
        # Extreme overall spending (>50% increase)
        if overall_percent > 50 and overall_increase > MIN_SPIKE_AMOUNT:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "CRITICAL",
                "title": "Extreme Spending Alert",
                "message": f"Your total spending is {overall_percent:.1f}% higher than usual (₹{total_weekly:.2f}, up ₹{overall_increase:.2f}).",
                "confidence": "HIGH",
                "category": "Overall",
                "weekly_spend": total_weekly,
                "priority": 1
            })
        # High overall spending (>30%)
        elif overall_percent > 30:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "WARNING",
                "title": "Overall Spending Alert",
                "message": f"Your total spending is {overall_percent:.1f}% higher than usual this week (₹{total_weekly:.2f}).",
                "confidence": "HIGH",
                "category": "Overall",
                "weekly_spend": total_weekly,
                "priority": 2
            })
        # Moderate overall spending (>15%)
        elif overall_percent > 15:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": "Spending Update",
                "message": f"Your spending is {overall_percent:.1f}% higher than usual this week (₹{total_weekly:.2f}).",
                "confidence": "MEDIUM",
                "category": "Overall",
                "weekly_spend": total_weekly,
                "priority": 3
            })
        # Low spending week - positive feedback
        elif overall_percent < -20 and weekly_avg > MIN_AMOUNT_THRESHOLD:
            notifications.append({
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": "Great Savings Week",
                "message": f"Your spending is {abs(overall_percent):.1f}% lower than usual (₹{total_weekly:.2f}). Keep it up!",
                "confidence": "MEDIUM",
                "category": "Overall",
                "weekly_spend": total_weekly,
                "priority": 4
            })
    
    # Remove duplicate notifications for the same category (keep highest priority)
    notifications = _deduplicate_notifications(notifications)
    
    # PRIORITY: Always return notification about the most recent transaction category
    if most_recent_category:
        # Check if we have a notification for the recent category
        for notif in notifications:
            if notif.get("category") == most_recent_category:
                return notif
        
        # If no notification exists for recent category, create a positive one
        category_data = categories.get(most_recent_category, {})
        category_weekly_spend = _safe_float(category_data.get("weekly_spend", 0))
        
        if category_weekly_spend > 0:
            return {
                "mode": "RULE_BASED",
                "severity": "INFO",
                "title": f"{most_recent_category} Purchase Recorded",
                "message": f"Your {most_recent_category} spending this week is ₹{category_weekly_spend:.2f}. Looking good!",
                "confidence": "MEDIUM",
                "category": most_recent_category
            }
    
    # Fallback: Return the most critical notification if no recent category context
    if notifications:
        notifications.sort(key=lambda x: (
            x.get("priority", 99),
            _severity_rank(x.get("severity", "INFO")),
            -_safe_float(x.get("weekly_spend", 0))
        ))
        return notifications[0]
    
    # Default positive message if no alerts at all
    if total_weekly > 0:
        return {
            "mode": "RULE_BASED",
            "severity": "INFO",
            "title": "Spending on Track",
            "message": f"Your spending is well-managed this week (₹{total_weekly:.2f}).",
            "confidence": "MEDIUM",
            "category": "Overall"
        }
    
    return _create_default_notification("No significant spending activity this week")


def _safe_float(value):
    """Safely convert value to float, handling None and invalid types."""
    if value is None:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def _severity_rank(severity):
    """Convert severity to numeric rank for sorting (lower is more critical)."""
    severity_map = {
        "CRITICAL": 0,
        "WARNING": 1,
        "INFO": 2,
        "SUCCESS": 3
    }
    return severity_map.get(severity, 99)


def _deduplicate_notifications(notifications):
    """Remove duplicate notifications for the same category, keeping highest priority."""
    seen_categories = {}
    deduplicated = []
    
    for notif in notifications:
        category = notif.get("category")
        priority = notif.get("priority", 99)
        
        if category not in seen_categories or priority < seen_categories[category]["priority"]:
            seen_categories[category] = notif
    
    return list(seen_categories.values())


def _create_default_notification(message):
    """Create a default notification with given message."""
    return {
        "mode": "RULE_BASED",
        "severity": "INFO",
        "title": "Spending Status",
        "message": message,
        "confidence": "LOW",
        "category": "Overall"
    }
