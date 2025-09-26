# ec2_instance_profile.py
import boto3

iam = boto3.client("iam")

def create_instance_profile(role_name):
    profile_name = "SpoticlyEC2RoleProfile"
    try:
        iam.create_instance_profile(InstanceProfileName=profile_name)
        print(f"✅ Instance Profile {profile_name} created")
    except iam.exceptions.EntityAlreadyExistsException:
        print(f"ℹ️ Instance Profile {profile_name} already exists, reusing it")

    # Attach role only if not already attached
    try:
        iam.add_role_to_instance_profile(
            InstanceProfileName=profile_name,
            RoleName=role_name
        )
        print(f"✅ Role {role_name} attached to {profile_name}")
    except iam.exceptions.LimitExceededException:
        print(f"ℹ️ Role already attached to {profile_name}, skipping")

    return profile_name

