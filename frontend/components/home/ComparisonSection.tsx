import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";

const comparisonData = [
  { feature: "AWS Well-Architected Framework", tesseric: true, chatgpt: false },
  { feature: "Structured JSON Output", tesseric: true, chatgpt: false },
  { feature: "Service-Specific Recommendations", tesseric: true, chatgpt: "Generic" },
  { feature: "Cost per Review", tesseric: "~$0.01", chatgpt: "$20/month" },
  { feature: "References to AWS Docs", tesseric: true, chatgpt: false },
  { feature: "Roast Mode", tesseric: true, chatgpt: false },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why Tesseric Beats ChatGPT
          </h2>
          <p className="text-lg text-muted-foreground">
            Generic advice vs. AWS-native expertise
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-muted-foreground">
                      Feature
                    </th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-foreground bg-primary/5">
                      <div className="flex items-center justify-center gap-2">
                        <Image
                          src="/tesseric-logo.png"
                          alt=""
                          width={20}
                          height={20}
                          className="rounded"
                        />
                        Tesseric
                      </div>
                    </th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-muted-foreground">
                      ChatGPT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-center bg-primary/5">
                        {row.tesseric === true ? (
                          <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.tesseric}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {row.chatgpt === true ? (
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.chatgpt === false ? (
                          <XCircle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.chatgpt}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Built by an AWS Solutions Architect candidate, for AWS practitioners.
          </p>
        </div>
      </div>
    </section>
  );
}
