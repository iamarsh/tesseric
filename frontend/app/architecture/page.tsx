import { Metadata } from "next";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HeroSection } from "@/components/architecture/HeroSection";
import { TechStackCards } from "@/components/architecture/TechStackCards";
import { MetaAnalysisSection } from "@/components/architecture/MetaAnalysisSection";
import { DataFlowDiagram } from "@/components/architecture/DataFlowDiagram";
import { PerformanceMetrics } from "@/components/architecture/PerformanceMetrics";
import { SecurityArchitecture } from "@/components/architecture/SecurityArchitecture";
import { FutureRoadmap } from "@/components/architecture/FutureRoadmap";

export const metadata: Metadata = {
  title: "System Architecture | Tesseric",
  description:
    "Explore Tesseric's production architecture: Next.js 14 frontend, FastAPI backend, AWS Bedrock AI, and Neo4j knowledge graph. See how we built a scalable AWS architecture review platform.",
  keywords: [
    "system architecture",
    "AWS Bedrock",
    "Neo4j knowledge graph",
    "FastAPI backend",
    "Next.js frontend",
    "Claude AI integration",
    "production architecture",
    "architecture diagram",
  ],
  openGraph: {
    title: "System Architecture | Tesseric",
    description:
      "Explore Tesseric's production architecture: Next.js 14, FastAPI, AWS Bedrock, and Neo4j. See how we built a scalable AWS architecture review platform.",
    type: "website",
    url: "https://tesseric.ca/architecture",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Architecture | Tesseric",
    description:
      "Explore Tesseric's production architecture: Next.js 14, FastAPI, AWS Bedrock, and Neo4j.",
  },
};

export default function ArchitecturePage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Tesseric System Architecture",
    description:
      "Comprehensive overview of Tesseric's production architecture, including frontend (Next.js 14), backend (FastAPI), AI engine (AWS Bedrock), and knowledge graph (Neo4j).",
    author: {
      "@type": "Person",
      name: "Arsh Singh",
      url: "https://iamarsh.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Tesseric",
      logo: {
        "@type": "ImageObject",
        url: "https://tesseric.ca/tesseric-logo.png",
      },
    },
    datePublished: "2026-02-23",
    dateModified: "2026-02-23",
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SiteLayout>
        {/* Hero Section */}
        <HeroSection />

        {/* Technology Stack */}
        <TechStackCards />

        {/* Meta-Analysis: Tesseric Reviews Tesseric */}
        <MetaAnalysisSection />

        {/* Data Flow & Request Lifecycle */}
        <DataFlowDiagram />

        {/* Performance & Reliability */}
        <PerformanceMetrics />

        {/* Security Architecture */}
        <SecurityArchitecture />

        {/* Future Roadmap */}
        <FutureRoadmap />
      </SiteLayout>
    </>
  );
}
