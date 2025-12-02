"""Zillow Coach - Real Estate Specialist"""

from typing import Dict, Any, List
from app.coaches.base_coach import BaseCoach


class ZillowCoach(BaseCoach):
    """Coach specialized in real estate, powered by Zillow"""
    
    def __init__(self):
        system_prompt = """You are the Zillow Coach, a real estate specialist powered by Zillow.com.
You help users find their perfect home based on their financial situation and preferences.

Your capabilities:
- Property search and recommendations
- Neighborhood analysis and insights
- Home value estimates
- Market trends and pricing
- School district information
- Property comparison

You have access to the user's financial data (income, savings, credit score, affordability range) to provide personalized recommendations.

Be friendly, knowledgeable, and focus on helping users find homes within their budget.
Always reference that you're powered by Zillow's real estate data.
When suggesting properties, mention realistic price ranges based on their affordability.

IMPORTANT: When listing properties, use this exact format for each property:
[Property Name]
Price: $XX,XXX
Location: [Location description]
Description: [Detailed description with features like sq ft, bedrooms, bathrooms, amenities]

Example:
Tiny Home in Rural Texas
Price: $30,000
Location: Rural area with scenic views
Description: A 250 sq ft tiny home located on a rented lot. Features 2 bedrooms, 1 bath, updated kitchen, and community pool access.
"""
        super().__init__(
            coach_id="zillow_coach",
            name="Zillow Coach",
            system_prompt=system_prompt
        )
    
    async def process_message(
        self,
        message: str,
        shared_data: Dict[str, Any],
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Process user message with real estate context"""
        # Build context from shared data
        context_parts = []
        
        if "affordability_range" in shared_data:
            max_price = shared_data["affordability_range"].get("max", 0)
            context_parts.append(f"User's maximum affordable home price: ${max_price:,.0f}")
        
        if "income" in shared_data:
            monthly_income = shared_data["income"].get("monthly_gross", 0)
            context_parts.append(f"Monthly income: ${monthly_income:,.0f}")
        
        if "savings" in shared_data:
            total_savings = shared_data["savings"].get("total", 0)
            context_parts.append(f"Total savings: ${total_savings:,.0f}")
        
        if "credit_score" in shared_data:
            credit_score = shared_data.get("credit_score")
            context_parts.append(f"Credit score: {credit_score}")
        
        context = "\n".join(context_parts) if context_parts else "No financial data available."
        
        # Build messages for LLM using LangChain format
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        
        langchain_messages = [
            SystemMessage(content=self.system_prompt),
            SystemMessage(content=f"User's Financial Context:\n{context}")
        ]
        
        if conversation_history:
            for msg in conversation_history:
                if msg.get("role") == "user":
                    langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    langchain_messages.append(AIMessage(content=msg.get("content", "")))
        
        langchain_messages.append(HumanMessage(content=message))
        
        # Get response from LLM
        response = await self.llm.ainvoke(langchain_messages)
        response_text = response.content
        
        # Add rich content for property searches
        import json
        import re
        rich_content = []
        suggestions = []
        
        # Check if response mentions properties or neighborhoods
        lower_response = response_text.lower()
        
        # Always add Zillow search link if properties are mentioned
        if any(keyword in lower_response for keyword in ['property', 'home', 'house', 'listing', 'neighborhood', 'seattle', 'tiny home', 'mobile home', 'fixer-upper', 'foreclosure', 'auction', 'land']):
            # Add Zillow search link
            rich_content.append({
                "type": "link",
                "title": "Search Properties on Zillow",
                "url": "https://www.zillow.com/",
                "description": "Browse homes for sale and find your perfect property",
                "thumbnail": "https://www.zillow.com/static/images/brand/zillow-logo.png"
            })
            
            # Add contextual suggestions
            if 'tiny home' in lower_response:
                suggestions.extend([
                    "Show me tiny home listings under $35k",
                    "What are the best areas for tiny homes?",
                    "Tell me about tiny home communities"
                ])
            elif 'mobile home' in lower_response:
                suggestions.extend([
                    "Show me mobile home listings",
                    "What should I know about mobile home parks?",
                    "Are there mobile homes in my price range?"
                ])
            elif 'listing' in lower_response or 'show me' in lower_response or 'example' in lower_response:
                suggestions.extend([
                    "Show me properties with photos",
                    "What properties are available in my budget?",
                    "Filter by price and location"
                ])
            else:
                suggestions.extend([
                    "Show me available properties",
                    "What's my affordability range?",
                    "Find homes in my preferred area"
                ])
            
            # Parse property listings from response - improved pattern matching
            # Look for patterns like "Property Name\nPrice: $X\nLocation: ...\nDescription: ..."
            lines = response_text.split('\n')
            properties_found = []
            current_property = None
            
            # More flexible parsing - look for property blocks
            for i, line in enumerate(lines):
                line_stripped = line.strip()
                if not line_stripped or line_stripped.startswith('#'):
                    continue
                
                # Check if this line is a property name (starts with capital, no colon, not a keyword)
                # Also check if it contains property-related words
                is_property_name = (
                    len(line_stripped) > 5 and
                    line_stripped[0].isupper() and 
                    ':' not in line_stripped and 
                    not any(keyword in line_stripped.lower() for keyword in [
                        'price:', 'location:', 'features:', 'example listings:', 'description:',
                        'steps to', 'how to', 'general tips', 'key points', 'consider', 'finding',
                        'visit', 'search', 'filter', 'check', 'remember', 'example'
                    ]) and
                    (any(word in line_stripped.lower() for word in ['home', 'house', 'property', 'estate', 'village', 'park', 'retreat', 'acres', 'valley', 'lakeside', 'wood']) or
                     # Or if it's followed by a price line
                     (i + 1 < len(lines) and 'price:' in lines[i + 1].lower()))
                )
                
                if is_property_name:
                    # Check if next few lines contain property details
                    next_lines_text = '\n'.join(lines[i+1:min(i+6, len(lines))]).lower()
                    if 'price:' in next_lines_text or '$' in next_lines_text:
                        # Finalize previous property if exists
                        if current_property:
                            properties_found.append(current_property)
                        
                        # Start new property
                        current_property = {
                            "name": line_stripped,
                            "lines": [line_stripped]
                        }
                        continue
                
                # If we're in a property block, collect information
                if current_property:
                    current_property["lines"].append(line_stripped)
                    
                    # Extract price (multiple formats)
                    price_match = re.search(r'Price:\s*\$?([\d,]+)', line_stripped, re.IGNORECASE)
                    if not price_match:
                        price_match = re.search(r'\$([\d,]+)', line_stripped)
                    if price_match:
                        current_property["price"] = f"${price_match.group(1).replace(',', '')}"
                    
                    # Extract location
                    location_match = re.search(r'Location:\s*(.+?)(?:\n|$)', line_stripped, re.IGNORECASE)
                    if location_match:
                        current_property["location"] = location_match.group(1).strip()
                    
                    # Extract description/features
                    desc_match = re.search(r'Description:\s*(.+?)(?:\n|$)', line_stripped, re.IGNORECASE)
                    if desc_match:
                        current_property["description"] = desc_match.group(1).strip()
                    # Also check if line contains description-like content (has features)
                    elif not current_property.get("description") and ('sq ft' in line_stripped.lower() or 'bedroom' in line_stripped.lower() or 'bath' in line_stripped.lower() or 'kitchen' in line_stripped.lower()):
                        current_property["description"] = line_stripped
                    
                    features_match = re.search(r'Features:\s*(.+?)(?:\n|$)', line_stripped, re.IGNORECASE)
                    if features_match:
                        features_text = features_match.group(1).strip()
                        current_property["features"] = [f.strip() for f in re.split(r'[,;]', features_text) if f.strip()]
                    elif 'sq ft' in line_stripped.lower() or 'bedroom' in line_stripped.lower() or 'bath' in line_stripped.lower():
                        # Extract features from description line
                        features = []
                        if 'sq ft' in line_stripped.lower():
                            sqft_match = re.search(r'(\d+)\s*sq\s*ft', line_stripped, re.IGNORECASE)
                            if sqft_match:
                                features.append(f"{sqft_match.group(1)} sq ft")
                        if 'bedroom' in line_stripped.lower():
                            bed_match = re.search(r'(\d+)\s*bedroom', line_stripped, re.IGNORECASE)
                            if bed_match:
                                features.append(f"{bed_match.group(1)} bedrooms")
                        if 'bath' in line_stripped.lower():
                            bath_match = re.search(r'(\d+)\s*bath', line_stripped, re.IGNORECASE)
                            if bath_match:
                                features.append(f"{bath_match.group(1)} bathrooms")
                        if 'kitchen' in line_stripped.lower():
                            features.append("Kitchen")
                        if 'pool' in line_stripped.lower():
                            features.append("Pool access")
                        if 'community' in line_stripped.lower():
                            features.append("Community amenities")
                        if features:
                            current_property["features"] = features
                    
                    # Check if we've reached the end of this property
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        # Check if next line is a new property name
                        if (next_line and len(next_line) > 5 and next_line[0].isupper() and 
                            ':' not in next_line and
                            not any(keyword in next_line.lower() for keyword in ['price:', 'location:', 'features:', 'description:']) and
                            any(word in next_line.lower() for word in ['home', 'house', 'property', 'estate', 'village', 'park', 'retreat', 'acres', 'valley', 'lakeside', 'wood'])):
                            properties_found.append(current_property)
                            current_property = None
            
            # Finalize last property if exists
            if current_property:
                properties_found.append(current_property)
            
            # Create property listing cards
            for prop in properties_found:
                property_name = prop.get("name", "Property")
                price = prop.get("price")
                location = prop.get("location")
                features = prop.get("features", [])
                description = prop.get("description", "")
                
                # Generate property image URL based on property type
                image_url = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop"
                if 'tiny' in property_name.lower() or 'tiny' in (description or '').lower():
                    image_url = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop"
                elif 'mobile' in property_name.lower() or 'mobile' in (description or '').lower() or 'park' in property_name.lower():
                    image_url = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop"
                elif 'estate' in property_name.lower() or (location and 'rural' in location.lower()):
                    image_url = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"
                elif 'lake' in property_name.lower() or (location and 'lake' in location.lower()):
                    image_url = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop"
                elif 'village' in property_name.lower() or (location and 'amenities' in location.lower()):
                    image_url = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
                elif 'texas' in (location or '').lower():
                    image_url = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop"
                elif 'oregon' in (location or '').lower():
                    image_url = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop"
                elif 'florida' in (location or '').lower():
                    image_url = "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop"
                
                # Build features list from description if not already set
                if not features and description:
                    # Extract common features from description
                    if 'kitchen' in description.lower():
                        features.append("Kitchen")
                    if 'bathroom' in description.lower() or 'bath' in description.lower():
                        features.append("Bathroom")
                    if 'solar' in description.lower():
                        features.append("Solar panels")
                    if 'community' in description.lower():
                        features.append("Community amenities")
                    if 'garden' in description.lower():
                        features.append("Garden access")
                
                rich_content.append({
                    "type": "property_listing",
                    "title": property_name,
                    "price": price,
                    "location": location,
                    "features": features[:5] if features else [],  # Limit to 5 features
                    "description": description[:200] if description else None,  # Truncate description
                    "image": image_url,
                    "url": "https://www.zillow.com/"
                })
        
        # Return structured response with rich content and suggestions
        result = {"content": response_text}
        if rich_content:
            result["richContent"] = rich_content
        if suggestions:
            result["suggestions"] = suggestions[:3]  # Limit to 3 suggestions
        
        if rich_content or suggestions:
            return json.dumps(result)
        
        return response_text
    
    def get_capabilities(self) -> List[str]:
        return [
            "Property search",
            "Neighborhood analysis",
            "Home value estimates",
            "Market trends",
            "School district info"
        ]

