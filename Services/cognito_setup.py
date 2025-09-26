import boto3

class CognitoSetup:
    def __init__(self, region="ap-south-1"):
        self.cognito = boto3.client("cognito-idp", region_name=region)

    def create_user_pool(self, pool_name="SpoticlyUserPool"):
        try:
            response = self.cognito.create_user_pool(
                PoolName=pool_name,
                AutoVerifiedAttributes=["email"]
            )
            user_pool_id = response["UserPool"]["Id"]
            print(f"✅ Cognito User Pool created: {user_pool_id}")
            return user_pool_id
        except Exception as e:
            print(f"⚠️ Error creating user pool: {e}")
            return None

    def create_user_pool_client(self, user_pool_id, client_name="SpoticlyClient"):
        try:
            response = self.cognito.create_user_pool_client(
                UserPoolId=user_pool_id,
                ClientName=client_name,
                GenerateSecret=False,
                ExplicitAuthFlows=["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
            )
            client_id = response["UserPoolClient"]["ClientId"]
            print(f"✅ Cognito App Client created: {client_id}")
            return client_id
        except Exception as e:
            print(f"⚠️ Error creating app client: {e}")
            return None