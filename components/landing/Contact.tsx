import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Contact() {
  return (
    <section id="contact" className="border-y bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Phone:</span>{" "}
              +251 9XX XXX XXX
            </p>
            <p>
              <span className="font-medium text-foreground">Telegram:</span>{" "}
              @clinicflow_et
            </p>
            <p>
              <span className="font-medium text-foreground">WhatsApp:</span>{" "}
              +251 9XX XXX XXX
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Request a Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your full name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clinicName">Clinic name</Label>
                <Input id="clinicName" placeholder="Your clinic" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+251..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell us about your clinic needs"
                />
              </div>
              <Button type="button" className="w-full">
                Send Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
