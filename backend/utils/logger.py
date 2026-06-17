# backend/utils/logger.py
import logging
import sys
from config.settings import settings

# Setup standard logging configuration
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("nextstep-ai")
