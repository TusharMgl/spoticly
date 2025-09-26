from ec2_iam_role import create_ec2_role
from ec2_instance_profile import create_instance_profile
from ec2_launch import launch_ec2
from load_balancer import create_load_balancer, register_instance_to_lb
import boto3
def wait_for_instance(instance_id):
    ec2 = boto3.client("ec2", region_name="ap-south-1")
    print(f"⏳ Waiting for EC2 instance {instance_id} to reach 'running' state...")
    waiter = ec2.get_waiter("instance_running")
    waiter.wait(InstanceIds=[instance_id])
    print(f"✅ Instance {instance_id} is now running.")
if __name__ == "__main__":
    print("🚀 Starting EC2 Deployment...")

    role = create_ec2_role()
    profile = create_instance_profile(role)
    instance_id = launch_ec2(profile)

    wait_for_instance(instance_id)

    vpc_id = "vpc-0b442149a52f89d49"
    subnet_ids = ["subnet-021b897298025a3ad", "subnet-06b1629db1d59ef4e"]
    sg_id = "sg-00d6c4d92d2fd25a8"

    lb_arn, tg_arn = create_load_balancer(vpc_id, subnet_ids, sg_id)
    
    register_instance_to_lb(instance_id, tg_arn, lb_arn)

    print("🎉 Deployment Complete! Access app via Load Balancer DNS")
