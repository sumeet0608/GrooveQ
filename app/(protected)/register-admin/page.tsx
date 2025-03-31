"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterAdminPage() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<"idle" | "success" | "error" | "already">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkExistingRequest = async () => {
      const res = await fetch("/api/admin-request");
      const data = await res.json();

      if (data.exists === true) {
        setSubmitted("already");
      }
    };

    if (status === "authenticated") {
      checkExistingRequest();
    }
  }, [status]);

  const handleSubmit = async () => {
    setError("");
    if (!message.trim()) {
      setError("Message is required.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      setSubmitted("success");
    } else {
      const data = await res.json();
      if (data?.error === "Request already exists") {
        setSubmitted("already");
      } else {
        setSubmitted("error");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 bg-background text-foreground">
      <h1 className="text-2xl font-semibold mb-4">Register as Admin</h1>

      {submitted === "success" && (
        <p className="text-green-500 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Request submitted successfully!
        </p>
      )}

      {submitted === "already" && (
        <p className="text-blue-500">You’ve already submitted a request. Sit tight!</p>
      )}

      {submitted === "error" && (
        <p className="text-red-500">Something went wrong. Please try again later.</p>
      )}

      {submitted === "idle" && (
        <>
          <Textarea
            placeholder="Why do you want admin access?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-2"
            required
          />
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
            Submit Request
          </Button>
        </>
      )}
    </div>
  );
}
