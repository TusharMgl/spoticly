import boto3

class DynamoDBSetup:
    def __init__(self, region="ap-south-1"):
        self.dynamodb = boto3.client("dynamodb", region_name=region)

    def create_songs_table(self, table_name="Songs"):
        try:
            resp = self.dynamodb.create_table(
                TableName=table_name,
                KeySchema=[
                    {"AttributeName": "songId", "KeyType": "HASH"}  # Partition key
                ],
                AttributeDefinitions=[
                    {"AttributeName": "songId", "AttributeType": "S"}
                ],
                ProvisionedThroughput={
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            )

            waiter = self.dynamodb.get_waiter("table_exists")
            waiter.wait(TableName=table_name)

            print(f"✅ DynamoDB Table '{table_name}' created")
            return resp["TableDescription"]["TableArn"]

        except Exception as e:
            print(f"⚠️ Error creating table: {e}")
            return None



