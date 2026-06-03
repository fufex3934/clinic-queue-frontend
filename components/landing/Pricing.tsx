import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tiers = [
  {
    name: "Starter",
    price: "1,000 ETB / month",
    features: ["Queue + appointments", "2 users"],
  },
  {
    name: "Growth",
    price: "2,000 ETB / month",
    features: ["Up to 5 users", "Reports"],
  },
  {
    name: "Premium",
    price: "3,500 ETB / month",
    features: ["Email alerts", "Full features"],
  },
];

export function Pricing() {
  return (
    <section id="pricing">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Simple Pricing for Growing Clinics
          </h2>
          <Badge>14 Days Free Trial</Badge>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className="border-border/70 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <p className="text-2xl font-bold">{tier.price}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {tier.features.map((feature) => (
                  <p key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" />
                    {feature}
                  </p>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" render={<Link href="#contact" />}>
                  Start Free Trial
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
