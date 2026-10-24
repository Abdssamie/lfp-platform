"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@convex-zen/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@convex-zen/ui/components/accordion";
import { Badge } from "@convex-zen/ui/components/badge";

type FaqItem = {
  value: string;
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    value: "item-1",
    question: "How do I use Convex Zen components in my project?",
    answer:
      "Convex Zen is a complete boilerplate with TanStack Start and Convex. It includes pre-built components, authentication, database schema, and more. Clone the repo, follow the setup instructions in the README, and customize to your needs.",
  },
  {
    value: "item-2",
    question: "What's included in the boilerplate?",
    answer:
      "Convex Zen includes Convex backend with database schema and functions, TanStack Start for frontend routing, Better Auth for authentication, Polar for payments, Brevo for email, and a complete UI component library. Everything you need to ship a SaaS fast.",
  },
  {
    value: "item-3",
    question: "Can I use this for commercial projects?",
    answer:
      "Yes! Convex Zen is open source under MIT license. Use it for personal projects, client work, and commercial products without attribution requirements.",
  },
  {
    value: "item-4",
    question: "Do you provide support?",
    answer:
      "Convex Zen is community-supported through GitHub issues. The boilerplate includes comprehensive documentation and the code is well-commented for easy customization.",
  },
  {
    value: "item-5",
    question: "What tech stack does it use?",
    answer:
      "Convex Zen uses Convex for the backend, TanStack Start for the frontend, React with TypeScript, Tailwind CSS for styling, and Better Auth for authentication. All选的 technologies are open-source with generous free tiers.",
  },
  {
    value: "item-6",
    question: "How often is it updated?",
    answer:
      "The boilerplate is maintained and updated regularly with new features, bug fixes, and improvements. Check the GitHub repository for the latest releases and changelog.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Convex Zen boilerplate, features, and setup. Still
            have questions? We're here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent">
            <div className="p-0">
              <Accordion type="single" collapsible className="space-y-5">
                {faqItems.map((item) => (
                  <AccordionItem
                    key={item.value}
                    value={item.value}
                    className="rounded-md !border bg-transparent"
                  >
                    <AccordionTrigger className="cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                          <CircleHelp className="size-5" />
                        </div>
                        <span className="text-start font-semibold">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 bg-transparent">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions? We're here to help.</p>
            <Button className="cursor-pointer" asChild>
              <a href="#contact">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FaqSection };
