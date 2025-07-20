from mcp import FastMCP
from typing import Optional, List, Dict, Any

mcp = FastMCP("sample-server")

@mcp.tool()
def get_weather(location: str, units: str = "celsius") -> Dict[str, Any]:
    """Get current weather for a location.
    
    Args:
        location (str): The location to get weather for
        units (str): Temperature units (celsius or fahrenheit)
        
    Returns:
        Dict[str, Any]: Weather information including temperature and conditions
    """
    # Mock weather data
    return {
        "location": location,
        "temperature": 22,
        "units": units,
        "conditions": "sunny"
    }

@mcp.tool()
def search_web(query: str, limit: int = 10) -> List[Dict[str, str]]:
    """Search the web for information.
    
    Args:
        query: Search query string
        limit: Maximum number of results to return
        
    Returns:
        List of search results with title and URL
    """
    # Mock search results
    return [
        {"title": f"Result for {query}", "url": "https://example.com"}
    ]

@mcp.resource()
def get_user_data(user_id: str) -> Dict[str, Any]:
    """Get user data resource.
    
    Args:
        user_id: Unique identifier for the user
        
    Returns:
        User data dictionary
    """
    return {"user_id": user_id, "name": "John Doe"}

class DataProcessor:
    """Data processing utility class."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize data processor.
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
    
    def process(self, data: Any) -> Any:
        """Process input data.
        
        Args:
            data: Input data to process
            
        Returns:
            Processed data
        """
        return data

if __name__ == "__main__":
    mcp.run()