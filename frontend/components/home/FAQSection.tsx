"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
  category: "pricing" | "privacy" | "technical" | "comparison" | "use-cases" | "framework";
}

const faqItems: FAQItem[] = [
  {
    category: "technical",
    question: "How does architecture visualization work?",
    answer: (
      <>
        <p className="mb-3">
          Tesseric <strong>recreates your AWS architecture topology</strong> as an interactive graph showing services and their relationships. When you submit an architecture description, our AI:
        </p>
        <ul className="space-y-2 mb-3 list-disc list-inside">
          <li><strong>Extracts services</strong>: Identifies AWS services (ALB, EC2, RDS, etc.)</li>
          <li><strong>Maps relationships</strong>: Determines how services connect (ROUTES_TO, WRITES_TO, MONITORS)</li>
          <li><strong>Detects patterns</strong>: Recognizes common architectures (3-tier, serverless, microservices)</li>
          <li><strong>Visualizes problems</strong>: Color-codes services by finding severity (red=critical, orange=high, yellow=medium)</li>
        </ul>
        <p className="mb-3">
          The topology is stored in a <strong>Neo4j knowledge graph</strong> that accumulates patterns across all reviews. Click a service in the graph to see which findings affect it, or click a finding card to highlight affected services.
        </p>
        <p>
          <strong>Example</strong>: Submit "ALB routes to EC2 which writes to RDS" → See ALB → EC2 → RDS topology with orange borders if EC2 isn't multi-AZ.
        </p>
      </>
    ),
  },
  {
    category: "privacy",
    question: "Where is my architecture data stored?",
    answer: (
      <>
        <p className="mb-3">
          <strong>Nowhere.</strong> Tesseric does not store your architecture descriptions or review results. All processing happens in real-time via AWS Bedrock, and data is discarded immediately after the review is delivered.
        </p>
        <p>
          We use <strong>ephemeral sessions</strong>-your architecture never touches a database. This means maximum privacy: no data breaches, no retention policies, no compliance headaches.
        </p>
      </>
    ),
  },
  {
    category: "privacy",
    question: "Is my sensitive information secure?",
    answer: (
      <>
        <p className="mb-3">
          Yes. Your architecture description is sent over <strong>HTTPS</strong> to our backend (hosted on Railway with AWS credentials via secrets management), then directly to <strong>Amazon Bedrock</strong> (AWS's fully managed AI service).
        </p>
        <p>
          Bedrock does not train models on your input data. Once the review is complete, all data is immediately discarded. We recommend <strong>not including specific IPs, account IDs, or credentials</strong> in your architecture descriptions-focus on design patterns and service configurations.
        </p>
      </>
    ),
  },
  {
    category: "technical",
    question: "Which AWS services does Tesseric support?",
    answer: (
      <>
        <p className="mb-3">
          Tesseric analyzes <strong>all AWS services</strong> mentioned in your architecture description, including:
        </p>
        <ul className="space-y-1.5 mb-3 list-disc list-inside">
          <li><strong>Compute</strong>: EC2, Lambda, ECS, EKS, Fargate</li>
          <li><strong>Storage</strong>: S3, EBS, EFS, Glacier</li>
          <li><strong>Database</strong>: RDS, Aurora, DynamoDB, Redshift, ElastiCache</li>
          <li><strong>Networking</strong>: VPC, ALB, NLB, Route 53, CloudFront, API Gateway</li>
          <li><strong>Security</strong>: IAM, KMS, Secrets Manager, GuardDuty, WAF</li>
          <li><strong>Monitoring</strong>: CloudWatch, X-Ray, CloudTrail</li>
          <li><strong>DevOps</strong>: CodePipeline, CodeBuild, CodeDeploy, CloudFormation</li>
        </ul>
        <p>
          If you describe a multi-tier web app, serverless API, data pipeline, or any AWS workload, Tesseric will analyze it against the <strong>6 Well-Architected pillars</strong>: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.
        </p>
      </>
    ),
  },
  {
    category: "technical",
    question: "What format is the review output?",
    answer: (
      <>
        <p className="mb-3">
          Tesseric returns <strong>structured JSON</strong> with:
        </p>
        <ul className="space-y-2 mb-3 list-disc list-inside">
          <li><strong>Architecture Score</strong> (0-100, weighted by pillar)</li>
          <li>
            <strong>Risks Array</strong>: Each risk includes:
            <ul className="ml-6 mt-1 space-y-1 list-circle">
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">id</code> (e.g., REL-001, SEC-002)</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">title</code> (e.g., "Single Availability Zone Deployment")</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">severity</code> (CRITICAL, HIGH, MEDIUM, LOW)</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">pillar</code> (reliability, security, cost_optimization, etc.)</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">finding</code> (what's wrong)</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">remediation</code> (how to fix it, with specific AWS service recommendations)</li>
              <li><code className="text-xs bg-muted px-1.5 py-0.5 rounded">references</code> (links to AWS documentation)</li>
            </ul>
          </li>
          <li><strong>Summary</strong>: 2-3 sentence overview of findings</li>
        </ul>
        <p>
          You can display this in your own UI, export to PDF, or integrate into CI/CD pipelines.
        </p>
      </>
    ),
  },
  {
    category: "comparison",
    question: "How is Tesseric different from ChatGPT?",
    answer: (
      <>
        <p className="mb-3">
          Great question. See our <a href="#comparison" className="text-primary hover:underline font-medium">comparison table</a> for details, but here's the short version:
        </p>
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm border border-border rounded">
            <thead className="bg-muted/30">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">Feature</th>
                <th className="py-2 px-3 text-left font-semibold">Tesseric</th>
                <th className="py-2 px-3 text-left font-semibold">ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="py-2 px-3">AWS Knowledge</td>
                <td className="py-2 px-3">Curated Well-Architected context (2024)</td>
                <td className="py-2 px-3">Generic 2023 training data</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-2 px-3">Output Format</td>
                <td className="py-2 px-3">Structured JSON with pillar mapping</td>
                <td className="py-2 px-3">Unstructured paragraphs</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-2 px-3">Recommendations</td>
                <td className="py-2 px-3">AWS-specific (e.g., "Enable RDS Multi-AZ")</td>
                <td className="py-2 px-3">Generic (e.g., "use encryption")</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-2 px-3">Architecture Focus</td>
                <td className="py-2 px-3">Purpose-built for AWS architectures</td>
                <td className="py-2 px-3">General-purpose assistant</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>TL;DR</strong>: Tesseric is purpose-built for AWS architectures with structured output. ChatGPT is a general assistant that sometimes gets AWS details wrong.
        </p>
      </>
    ),
  },
  {
    category: "comparison",
    question: "Should I use Tesseric or AWS Config?",
    answer: (
      <>
        <p className="mb-3">They solve different problems:</p>
        <ul className="space-y-2 mb-3 list-disc list-inside">
          <li>
            <strong>AWS Config</strong>: Monitors your <em>deployed</em> AWS resources for compliance drift (e.g., "Is this S3 bucket encrypted?"). Great for governance and auditing existing environments.
          </li>
          <li>
            <strong>Tesseric</strong>: Reviews your <em>proposed</em> architecture designs <em>before</em> deployment (e.g., "Should I use S3 encryption? Single-AZ RDS?"). Great for design validation and learning.
          </li>
        </ul>
        <p>
          <strong>Use both</strong>: Use Tesseric during architecture design and AWS Config for ongoing compliance monitoring in production.
        </p>
      </>
    ),
  },
  {
    category: "use-cases",
    question: "Can I use this for production architectures?",
    answer: (
      <>
        <p className="mb-3">
          Absolutely. Many users review production architectures to identify cost optimizations, security gaps, and reliability improvements.
        </p>
        <p className="mb-3">
          <strong>Recommendation</strong>: For sensitive production environments, describe the architecture pattern without including specific:
        </p>
        <ul className="space-y-1 mb-3 list-disc list-inside">
          <li>AWS account IDs</li>
          <li>Private IP addresses</li>
          <li>Secret keys or credentials</li>
          <li>Customer data examples</li>
        </ul>
        <p>
          Focus on the design (e.g., "Multi-AZ RDS with automated backups, KMS encryption") rather than specific identifiers.
        </p>
      </>
    ),
  },
  {
    category: "use-cases",
    question: "Is this suitable for AWS Solutions Architect exam prep?",
    answer: (
      <>
        <p className="mb-3">
          Yes! Tesseric is perfect for SAA-C03 candidates. You can:
        </p>
        <ol className="space-y-2 mb-3 list-decimal list-inside">
          <li><strong>Test practice exam architectures</strong>: Paste scenario descriptions and validate your understanding against Well-Architected principles.</li>
          <li><strong>Learn by doing</strong>: Get instant feedback on whether your design choices align with AWS best practices.</li>
          <li><strong>Identify knowledge gaps</strong>: If Tesseric flags something you missed, you know where to study.</li>
        </ol>
        <p>
          Many SAA candidates use Tesseric to validate their understanding of reliability patterns (Multi-AZ, backups), security (IAM, encryption), and cost optimization (Reserved Instances, right-sizing).
        </p>
      </>
    ),
  },
  {
    category: "framework",
    question: "What is the AWS Well-Architected Framework?",
    answer: (
      <>
        <p className="mb-3">
          The <a href="https://aws.amazon.com/architecture/well-architected/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">AWS Well-Architected Framework</a> is Amazon's official set of best practices for designing cloud workloads. It covers <strong>6 pillars</strong>:
        </p>
        <ol className="space-y-1.5 mb-3 list-decimal list-inside">
          <li><strong>Operational Excellence</strong>: Run and monitor systems effectively</li>
          <li><strong>Security</strong>: Protect data and systems</li>
          <li><strong>Reliability</strong>: Ensure workloads recover from failures</li>
          <li><strong>Performance Efficiency</strong>: Use resources efficiently</li>
          <li><strong>Cost Optimization</strong>: Minimize costs</li>
          <li><strong>Sustainability</strong>: Reduce environmental impact</li>
        </ol>
        <p>
          Tesseric analyzes your architecture against these pillars and maps risks to specific Well-Architected concerns.
        </p>
      </>
    ),
  },
  {
    category: "framework",
    question: "What is Roast Mode?",
    answer: (
      <>
        <p className="mb-3">
          Roast Mode is Tesseric's <em>brutally honest</em> review tone. Instead of polite professional feedback, you get:
        </p>
        <ul className="space-y-1.5 mb-3 list-disc list-inside">
          <li><strong>Sarcastic but accurate</strong> critiques</li>
          <li><strong>Career-questioning humor</strong> (e.g., "Single AZ in 2026? Are you TRYING to get fired?")</li>
          <li><strong>Dark AWS jokes</strong> (e.g., "When us-east-1a inevitably goes down, you'll be updating your résumé")</li>
        </ul>
        <p>
          <strong>It's the same technical analysis</strong>-just delivered with Gordon Ramsay energy. Use Roast Mode when you want a reality check or need a laugh while learning. Use Standard Mode for stakeholder presentations.
        </p>
      </>
    ),
  },
];

export function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Tesseric, answered.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-0 border border-border rounded-2xl overflow-hidden bg-card shadow-xl">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`border-b border-border last:border-b-0 ${
                  expandedIndex === index ? "border-l-2 border-l-primary" : ""
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                  aria-expanded={expandedIndex === index}
                >
                  <span className="text-base font-semibold text-foreground pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedIndex === index && (
                  <div className="px-6 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
                    {typeof item.answer === "string" ? (
                      <p>{item.answer}</p>
                    ) : (
                      item.answer
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
