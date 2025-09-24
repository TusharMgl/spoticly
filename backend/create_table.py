import boto3

dynamodb = boto3.client("dynamodb", region_name="us-east-1")

table_name = "Notes"

try:
    response = dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "id", "KeyType": "HASH"},  # Partition key
        ],
        AttributeDefinitions=[
            {"AttributeName": "id", "AttributeType": "S"},
        ],
        BillingMode="PAY_PER_REQUEST",  # On-demand billing
    )
    print(f"✅ Creating table {table_name} ...")
    print(response)
except dynamodb.exceptions.ResourceInUseException:
    print(f"⚠️ Table {table_name} already exists.")
