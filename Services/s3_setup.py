import boto3
import json

class S3Setup:
    def __init__(self, region="us-east-1"):
        self.s3 = boto3.client("s3", region_name=region)
        self.region = region

    def create_bucket(self, bucket_name):
        """Create S3 bucket and unblock public access"""
        if self.region == "us-east-1":
            self.s3.create_bucket(Bucket=bucket_name)
        else:
            self.s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": self.region}
            )

        print(f"✅ S3 bucket created: {bucket_name}")

        # Disable block public access
        self.s3.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": False,
                "IgnorePublicAcls": False,
                "BlockPublicPolicy": False,
                "RestrictPublicBuckets": False
            }
        )

        # Attach a bucket policy for public read
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }

        self.s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )

        print(f"🌍 Public access enabled for {bucket_name}")
        return bucket_name

    def upload_file(self, bucket_name, file_path, key):
        """Upload file to S3 (publicly accessible)"""
        self.s3.upload_file(
            file_path,
            bucket_name,
            key,
            ExtraArgs={"ACL": "public-read"}   # 👈 Public access for object
        )
        print(f"📂 Uploaded {file_path} to s3://{bucket_name}/{key}")
        return f"https://{bucket_name}.s3.{self.region}.amazonaws.com/{key}"
