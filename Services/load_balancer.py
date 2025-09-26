import boto3
elbv2 = boto3.client("elbv2")
def create_load_balancer(vpc_id, subnet_ids, sg_id):
    lb = elbv2.create_load_balancer(
        Name="SpoticlyLB",
        Subnets=subnet_ids,
        SecurityGroups=[sg_id],
        Scheme="internet-facing",
        Type="application",
        IpAddressType="ipv4" 
        )
    lb_arn = lb["LoadBalancers"][0]["LoadBalancerArn"]
    print(f"✅ Load Balancer Created: {lb_arn}")
    target_group = elbv2.create_target_group(
        Name="SpoticlyTG",
        Protocol="HTTP",
        Port=5000,
        VpcId=vpc_id,
        TargetType="instance"
    )
    tg_arn = target_group["TargetGroups"][0]["TargetGroupArn"]
    print(f"✅ Target Group Created: {tg_arn}")
    return lb_arn, tg_arn
def register_instance_to_lb(instance_id, tg_arn, lb_arn):
    elbv2.register_targets(
        TargetGroupArn=tg_arn,
        Targets=[{"Id": instance_id}]
    )
    print(f"🔗 EC2 {instance_id} registered to TG")
    elbv2.create_listener(
        LoadBalancerArn=lb_arn,
        Protocol="HTTP",
        Port=80,
        DefaultActions=[{"Type": "forward", "TargetGroupArn": tg_arn}]
    )
    print("✅ Listener created on port 80")
