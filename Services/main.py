from services.s3_setup import S3Setup
from services.dynamodb_setup import DynamoDBSetup
from services.cognito_setup import CognitoSetup

def main():
    region = "ap-south-1"

    print("🚀 Starting AWS Infrastructure Setup...")

    # -------------------------
    # S3 Setup
    # -------------------------
    s3 = S3Setup(region)
    bucket_name = "spoticly-songs"
    s3_bucket = s3.create_bucket(bucket_name)

    # -------------------------
    # DynamoDB Setup
    # -------------------------
    db = DynamoDBSetup(region)
    table_arn = db.create_songs_table("Songs")

    # -------------------------
    # Cognito Setup
    # -------------------------
    cognito = CognitoSetup(region)
    user_pool_id = cognito.create_user_pool("SpoticlyUserPool")
    client_id = None
    if user_pool_id:
        client_id = cognito.create_user_pool_client(user_pool_id, "SpoticlyClient")

    # -------------------------
    # Final Summary
    # -------------------------
    print("\n✅ Setup Complete!")
    print(f"📦 S3 Bucket: {s3_bucket}")
    print(f"📂 DynamoDB Songs Table ARN: {table_arn}")
    print(f"👥 Cognito User Pool ID: {user_pool_id}")
    print(f"🔑 Cognito Client ID: {client_id}")


if __name__ == "__main__":
    main()
