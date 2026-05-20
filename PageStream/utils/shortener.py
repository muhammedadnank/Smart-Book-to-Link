# PageStream/utils/shortener.py

async def shorten(url: str) -> str:
    """
    Dummy shortener that immediately returns the original URL.
    This safely bypasses the URL shortening feature across the entire codebase.
    """
    return url
