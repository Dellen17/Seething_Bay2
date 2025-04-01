import logging
from storages.backends.s3boto3 import S3Boto3Storage # type: ignore
from botocore.exceptions import ClientError # type: ignore

# Configure logger
logger = logging.getLogger(__name__)

class StrictS3Boto3Storage(S3Boto3Storage):
    def _save(self, name, content):
        logger.info(f"Attempting to upload file to S3: {name}")
        try:
            logger.debug(f"File content size: {content.size} bytes")
            result = super()._save(name, content)
            logger.info(f"File uploaded successfully to S3: {name}, result: {result}")
            return result
        except ClientError as e:
            logger.error(f"S3 upload failed for {name}: {str(e)}")
            raise Exception(f"S3 upload failed: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error during S3 upload for {name}: {str(e)}")
            raise