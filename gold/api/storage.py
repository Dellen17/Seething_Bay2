from storages.backends.s3boto3 import S3Boto3Storage # type: ignore
from botocore.exceptions import ClientError # type: ignore

class StrictS3Boto3Storage(S3Boto3Storage):
    def _save(self, name, content):
        try:
            return super()._save(name, content)
        except ClientError as e:
            raise Exception(f"S3 upload failed: {str(e)}") from e