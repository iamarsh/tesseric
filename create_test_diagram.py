#!/usr/bin/env python3
"""
Generate a simple AWS architecture diagram for testing image upload feature.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_diagram():
    # Create image
    width, height = 800, 600
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # Try to use a system font, fallback to default
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Title
    draw.text((width/2, 30), "AWS 3-Tier Web Application", fill='black',
              font=title_font, anchor='mm')

    # VPC Box
    vpc_box = [50, 80, width-50, height-80]
    draw.rectangle(vpc_box, outline='blue', width=2)
    draw.text((60, 90), "VPC (10.0.0.0/16)", fill='blue', font=text_font)

    # Public Subnet
    pub_subnet = [70, 120, width-70, 220]
    draw.rectangle(pub_subnet, outline='green', width=2)
    draw.text((80, 130), "Public Subnet (10.0.1.0/24)", fill='green', font=small_font)

    # ALB
    alb_box = [width/2-60, 150, width/2+60, 190]
    draw.rectangle(alb_box, fill='lightblue', outline='darkblue', width=2)
    draw.text((width/2, 170), "ALB", fill='black', font=text_font, anchor='mm')

    # Private Subnet - App Tier
    app_subnet = [70, 240, width-70, 360]
    draw.rectangle(app_subnet, outline='orange', width=2)
    draw.text((80, 250), "Private Subnet - App (10.0.2.0/24)", fill='orange', font=small_font)

    # EC2 Instances
    ec2_1 = [width/2-120, 280, width/2-20, 340]
    draw.rectangle(ec2_1, fill='lightcoral', outline='darkred', width=2)
    draw.text((width/2-70, 300), "EC2", fill='black', font=text_font, anchor='mm')
    draw.text((width/2-70, 320), "t3.medium", fill='black', font=small_font, anchor='mm')

    ec2_2 = [width/2+20, 280, width/2+120, 340]
    draw.rectangle(ec2_2, fill='lightcoral', outline='darkred', width=2)
    draw.text((width/2+70, 300), "EC2", fill='black', font=text_font, anchor='mm')
    draw.text((width/2+70, 320), "t3.medium", fill='black', font=small_font, anchor='mm')

    # Private Subnet - DB Tier
    db_subnet = [70, 380, width-70, 500]
    draw.rectangle(db_subnet, outline='purple', width=2)
    draw.text((80, 390), "Private Subnet - DB (10.0.3.0/24)", fill='purple', font=small_font)

    # RDS
    rds_box = [width/2-80, 420, width/2+80, 480]
    draw.rectangle(rds_box, fill='lightgreen', outline='darkgreen', width=2)
    draw.text((width/2, 440), "RDS MySQL", fill='black', font=text_font, anchor='mm')
    draw.text((width/2, 460), "Single AZ (NO Multi-AZ)", fill='red', font=small_font, anchor='mm')

    # S3 Bucket (outside VPC)
    s3_box = [width-180, height-70, width-60, height-20]
    draw.rectangle(s3_box, fill='lightyellow', outline='orange', width=2)
    draw.text((width-120, height-55), "S3 Bucket", fill='black', font=small_font, anchor='mm')
    draw.text((width-120, height-35), "Public Access", fill='red', font=small_font, anchor='mm')

    # Draw connections
    # ALB to EC2s
    draw.line([(width/2, 190), (width/2-70, 280)], fill='black', width=2)
    draw.line([(width/2, 190), (width/2+70, 280)], fill='black', width=2)

    # EC2s to RDS
    draw.line([(width/2-70, 340), (width/2, 420)], fill='black', width=2)
    draw.line([(width/2+70, 340), (width/2, 420)], fill='black', width=2)

    # Add warning text
    draw.text((width/2, height-10), "⚠️ Poor Architecture - No encryption, Single AZ, Public S3",
              fill='red', font=small_font, anchor='mm')

    return img

if __name__ == "__main__":
    img = create_test_diagram()
    output_path = "test-architecture-diagram.png"
    img.save(output_path)
    print(f"✅ Test diagram created: {output_path}")
    print(f"   Size: {os.path.getsize(output_path) / 1024:.1f} KB")
    print(f"   Dimensions: {img.size[0]}x{img.size[1]}px")
