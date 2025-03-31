"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type AdminRequest = {
  id: string;
  user: {
    name: string | null;
    email: string;
    image?: string | null;
  };
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function SuperAdminPanel() {
  const [requests, setRequests] = useState<AdminRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/super-admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setRequests((prev) => {
        if (!prev) return prev; // safely return null
        return prev.map((req) =>
          req.id === id ? { ...req, status: action === "approve" ? "APPROVED" : "REJECTED" } : req
        );
      });      
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Super Admin Panel</h1>
      {loading ? (
  <div className="flex items-center gap-2 text-muted-foreground">
    <Loader2 className="animate-spin w-4 h-4" />
    Loading requests...
  </div>
) : !requests ? (
  <p className="text-red-500">Failed to load requests.</p>
) : requests.length === 0 ? (
  <p className="text-muted-foreground">No admin requests found.</p>
) : (
  <div className="space-y-4">
    {requests.map((req) => (
      <Card key={req.id} className="bg-[#1a1a1a] border border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{req.user.name ?? "Unnamed User"}</p>
              <p className="text-sm text-muted-foreground">{req.user.email}</p>
              {req.message && <p className="mt-2 italic">"{req.message}"</p>}
              <p className="mt-1 text-xs text-muted-foreground">Status: {req.status}</p>
            </div>
            {req.status === "PENDING" && (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => handleAction(req.id, "approve")}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => handleAction(req.id, "reject")}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}

    </div>
  );
}
