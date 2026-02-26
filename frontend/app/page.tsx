"use client";

import { useState } from "react";
import { ReviewRequest, ReviewResponse, submitReview } from "@/lib/api";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveReviewSection } from "@/components/home/LiveReviewSection";
import { UnderTheHoodSection } from "@/components/home/UnderTheHoodSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CaseStudiesSection } from "@/components/home/CaseStudiesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PersonasSection } from "@/components/home/PersonasSection";
import { FAQSection } from "@/components/home/FAQSection";
import { RoadmapTeaser } from "@/components/home/RoadmapTeaser";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import TechnicalChallengesSection from "@/components/home/TechnicalChallengesSection";

export default function Home() {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTone, setCurrentTone] = useState<"standard" | "roast">("standard");
  const [lastRequest, setLastRequest] = useState<ReviewRequest | null>(null);

  const handleSubmit = async (request: ReviewRequest) => {
    setLoading(true);
    setError(null);
    setCurrentTone(request.tone);
    setLastRequest(request);

    try {
      const result = await submitReview(request);
      setReview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze architecture");
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTone = async () => {
    if (!lastRequest) return;

    const newTone: "standard" | "roast" = currentTone === "standard" ? "roast" : "standard";
    setCurrentTone(newTone);

    const updatedRequest: ReviewRequest = {
      ...lastRequest,
      tone: newTone,
    };

    await handleSubmit(updatedRequest);
  };

  const handleReset = () => {
    setReview(null);
    setLastRequest(null);
    setError(null);
  };

  // Structured data for SEO (multiple schemas)
  const structuredData = [
    // SoftwareApplication schema
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Tesseric",
      "applicationCategory": "DeveloperApplication",
      "description": "Instant AWS architecture reviews that deliver a Well-Architected-aligned score, risks, and remediations",
      "operatingSystem": "Web",
      "url": "https://tesseric.ca",
      "author": {
        "@type": "Person",
        "name": "Arsh Singh",
        "url": "https://iamarsh.com"
      },
      "featureList": [
        "AWS Well-Architected Framework alignment",
        "Powered by Amazon Bedrock and Claude 3.5 Haiku",
        "Architecture score from 0 to 100",
        "Structured risk identification with severity levels",
        "Remediation recommendations",
        "Professional and Roast tone modes",
        "No signup required",
        "Neo4j knowledge graph integration"
      ]
    },
    // Organization schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Tesseric",
      "url": "https://tesseric.ca",
      "logo": "https://tesseric.ca/tesseric-logo.png",
      "description": "Instant AWS architecture reviews with Well-Architected-aligned scores and remediation recommendations",
      "founder": {
        "@type": "Person",
        "name": "Arsh Singh",
        "url": "https://iamarsh.com"
      },
      "sameAs": [
        "https://github.com/iamarsh/tesseric"
      ]
    },
    // FAQPage schema
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Where is my architecture data stored?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nowhere. Tesseric does not store your architecture descriptions or review results. All processing happens in real-time via AWS Bedrock, and data is discarded immediately after the review is delivered. We use ephemeral sessions-your architecture never touches a database."
          }
        },
        {
          "@type": "Question",
          "name": "Which AWS services does Tesseric support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tesseric analyzes all AWS services mentioned in your architecture description, including Compute (EC2, Lambda, ECS, EKS, Fargate), Storage (S3, EBS, EFS, Glacier), Database (RDS, Aurora, DynamoDB, Redshift, ElastiCache), Networking (VPC, ALB, NLB, Route 53, CloudFront, API Gateway), Security (IAM, KMS, Secrets Manager, GuardDuty, WAF), Monitoring (CloudWatch, X-Ray, CloudTrail), and DevOps (CodePipeline, CodeBuild, CodeDeploy, CloudFormation). Tesseric analyzes against the 6 Well-Architected pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability."
          }
        },
        {
          "@type": "Question",
          "name": "How is Tesseric different from ChatGPT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tesseric is purpose-built for AWS architectures with curated Well-Architected context (2024), structured JSON output with pillar mapping, and AWS-specific recommendations (e.g., 'Enable RDS Multi-AZ'). ChatGPT uses generic 2023 training data, provides unstructured paragraphs, and gives generic advice (e.g., 'use encryption')."
          }
        },
        {
          "@type": "Question",
          "name": "Is this suitable for AWS Solutions Architect exam prep?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Tesseric is perfect for SAA-C03 candidates. You can test practice exam architectures, get instant feedback on whether your design choices align with AWS best practices, and identify knowledge gaps. Many SAA candidates use Tesseric to validate their understanding of reliability patterns (Multi-AZ, backups), security (IAM, encryption), and cost optimization."
          }
        },
        {
          "@type": "Question",
          "name": "What is Roast Mode?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Roast Mode is Tesseric's brutally honest review tone with sarcastic but accurate critiques, career-questioning humor, and dark AWS jokes. It's the same technical analysis-just delivered with Gordon Ramsay energy. Use Roast Mode when you want a reality check or need a laugh while learning. Use Standard Mode for stakeholder presentations."
          }
        }
      ]
    },
    // Review schema (testimonials)
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "Tesseric"
      },
      "author": {
        "@type": "Person",
        "name": "Emily Patel"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Tesseric caught a single-AZ RDS setup that would've cost us $200K+ in downtime. The review literally saved us a quarter-million dollars. Now I review every architecture before stakeholder presentations."
    },
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "Tesseric"
      },
      "author": {
        "@type": "Person",
        "name": "James Rodriguez"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "I used Tesseric to validate my practice exam architectures. The instant Well-Architected feedback helped me understand reliability patterns way faster than reading docs. Passed SAA-C03 on first try."
    },
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "SoftwareApplication",
        "name": "Tesseric"
      },
      "author": {
        "@type": "Person",
        "name": "Michael Torres"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "Our AWS bill dropped 28% after one Tesseric review. We were over-provisioned on EC2 and paying for unnecessary NAT gateways. The roast mode was brutal but accurate-exactly what we needed."
    }
  ];

  return (
    <>
      {/* Structured Data for SEO - Multiple schemas */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <SiteLayout>
        <HeroSection />

      <LiveReviewSection
        review={review}
        loading={loading}
        error={error}
        currentTone={currentTone}
        onSubmit={handleSubmit}
        onToggleTone={handleToggleTone}
        onReset={handleReset}
      />

      {/* Only show marketing sections if no active review */}
      {!review && (
        <>
          <HowItWorksSection />
          <UnderTheHoodSection />
          <TechnicalChallengesSection />
          <TestimonialsSection />
          <CaseStudiesSection />
          <PersonasSection />
          <ComparisonSection />
          <FAQSection />
          <RoadmapTeaser />
        </>
      )}

      <FinalCTA />
      </SiteLayout>
    </>
  );
}
