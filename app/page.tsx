import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-end p-4 pb-12 bg-background">
      {/* Container for the summary results (will grow as content is added) */}
      <div className="flex-1 w-full max-w-2xl flex flex-col justify-center text-center mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Summ-It-Up</h1>
        <p className="text-zinc-400">
          Paste a URL or text below to get started.
        </p>
      </div>

      {/* The Input Card */}
      <Card className="w-full max-w-2xl border-border bg-card shadow-2xl">
        <CardContent className="p-4 flex flex-col gap-3">
          <Textarea
            placeholder="Paste your link..."
            className="text-white h-10 py-2 bg-transparent border-none focus-visible:ring-0 resize-none text-base"
          />
          <div className="flex justify-end">
            <SendHorizontal className="cursor-pointer w-5 h-5 text-white" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
