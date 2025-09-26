# ec2_iam_role.py
import boto3
import json

iam = boto3.client("iam")

def create_ec2_role():
    role_name = "SpoticlyEC2Role"
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }

    # Create role
    try:
        iam.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
        print(f"✅ IAM Role created: {role_name}")
    except iam.exceptions.EntityAlreadyExistsException:
        print(f"⚠️ Role {role_name} already exists")

    # Attach AWS Managed Policies
    policies = [
        "arn:aws:iam::aws:policy/AmazonS3FullAccess",
        "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
        "arn:aws:iam::aws:policy/AmazonCognitoPowerUser"
    ]
    for policy in policies:
        iam.attach_role_policy(RoleName=role_name, PolicyArn=policy)
        print(f"🔑 Attached {policy}")

    return role_name
