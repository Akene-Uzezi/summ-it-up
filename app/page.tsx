"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backendUrl}/summarize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: inputValue }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        setTimeout(() => {
          setError(errorData.message || "An error occurred while summarizing.");
        }, 3000);
      }
      const data = await response.json();
      setSummary(data.summary);
      setInputValue("");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-end p-4 pb-12 bg-background">
      {/* Container for the summary results (will grow as content is added) */}
      {!(loading || summary) && (
        <div className="flex-1 w-full max-w-2xl flex flex-col justify-center text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Summ-It-Up</h1>
          <p className="text-zinc-400">
            Paste a URL or text below to get started.
          </p>
        </div>
      )}
      {error && !loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          <CardContent className="p-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
      {loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          <CardContent className="p-4 flex flex-col gap-3">
            <h2 className="animate-pulse text-lg font-semibold text-white mb-2">
              Summarizing...
            </h2>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}
      {summary && !loading && (
        <Card className="w-full max-w-2xl border-border bg-card shadow-2xl overflow-hidden mb-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-white mb-2">Summary</h2>
            <p className="text-zinc-400 whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* The Input Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          layout: {
            duration: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 25,
          },
        }}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <Card className="border-border bg-card shadow-2xl overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-3">
              <Textarea
                placeholder="Paste your link..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                name="input"
                autoResize
                minRows={1}
                maxRows={6}
                className="text-white py-2 bg-transparent border-none focus-visible:ring-0 text-base"
              />
              <div className="flex justify-end">
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-white" />
                ) : (
                  <button
                    type="submit"
                    className="cursor-pointer p-2 rounded-md bg-transparent hover:bg-zinc-900 transition-colors"
                  >
                    <SendHorizontal className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </main>
  );
}
