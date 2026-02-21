import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getQueryFn } from "@/lib/query-client";
import { differenceInDays, differenceInMonths, differenceInYears, differenceInHours, differenceInMinutes, parseISO } from "date-fns";
import milestones, { Milestone } from "@/constants/milestones";
import loveQuotes from "@/constants/quotes";
import type { Couple, Memory, ImportantDate, InsertCouple, InsertMemory, InsertImportantDate } from "@shared/schema";

interface LoveContextValue {
  couple: Couple | null;
  memories: Memory[];
  importantDates: ImportantDate[];
  isLoading: boolean;
  daysInLove: number;
  monthsInLove: number;
  yearsInLove: number;
  hoursInLove: number;
  minutesInLove: number;
  nextMilestone: Milestone | null;
  todayQuote: string;
  createCouple: (data: InsertCouple) => Promise<void>;
  updateCouple: (data: Partial<InsertCouple>) => Promise<void>;
  addMemory: (data: InsertMemory) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  addImportantDate: (data: InsertImportantDate) => Promise<void>;
  deleteImportantDate: (id: string) => Promise<void>;
}

const LoveContext = createContext<LoveContextValue | null>(null);

export function LoveProvider({ children }: { children: ReactNode }) {
  const coupleQuery = useQuery<Couple | null>({
    queryKey: ["/api/couple"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const couple = coupleQuery.data ?? null;
  const coupleId = couple?.id;

  const memoriesQuery = useQuery<Memory[]>({
    queryKey: ["/api/memories", coupleId],
    enabled: !!coupleId,
  });

  const importantDatesQuery = useQuery<ImportantDate[]>({
    queryKey: ["/api/important-dates", coupleId],
    enabled: !!coupleId,
  });

  const createCoupleMutation = useMutation({
    mutationFn: async (data: InsertCouple) => {
      await apiRequest("POST", "/api/couple", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple"] });
    },
  });

  const updateCoupleMutation = useMutation({
    mutationFn: async (data: Partial<InsertCouple>) => {
      await apiRequest("PUT", `/api/couple/${coupleId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple"] });
    },
  });

  const addMemoryMutation = useMutation({
    mutationFn: async (data: InsertMemory) => {
      await apiRequest("POST", "/api/memories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories", coupleId] });
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/memories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories", coupleId] });
    },
  });

  const addImportantDateMutation = useMutation({
    mutationFn: async (data: InsertImportantDate) => {
      await apiRequest("POST", "/api/important-dates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/important-dates", coupleId] });
    },
  });

  const deleteImportantDateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/important-dates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/important-dates", coupleId] });
    },
  });

  const now = new Date();
  const startDate = couple?.startDate ? parseISO(couple.startDate) : now;

  const daysInLove = couple ? differenceInDays(now, startDate) : 0;
  const monthsInLove = couple ? differenceInMonths(now, startDate) : 0;
  const yearsInLove = couple ? differenceInYears(now, startDate) : 0;
  const hoursInLove = couple ? differenceInHours(now, startDate) : 0;
  const minutesInLove = couple ? differenceInMinutes(now, startDate) : 0;

  const nextMilestone = useMemo(() => {
    if (!couple) return null;
    return milestones.find((m) => m.days > daysInLove) ?? null;
  }, [couple, daysInLove]);

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return loveQuotes[dayOfYear % loveQuotes.length];
  }, []);

  const value = useMemo<LoveContextValue>(
    () => ({
      couple,
      memories: memoriesQuery.data ?? [],
      importantDates: importantDatesQuery.data ?? [],
      isLoading: coupleQuery.isLoading,
      daysInLove,
      monthsInLove,
      yearsInLove,
      hoursInLove,
      minutesInLove,
      nextMilestone,
      todayQuote,
      createCouple: async (data) => {
        await createCoupleMutation.mutateAsync(data);
      },
      updateCouple: async (data) => {
        await updateCoupleMutation.mutateAsync(data);
      },
      addMemory: async (data) => {
        await addMemoryMutation.mutateAsync(data);
      },
      deleteMemory: async (id) => {
        await deleteMemoryMutation.mutateAsync(id);
      },
      addImportantDate: async (data) => {
        await addImportantDateMutation.mutateAsync(data);
      },
      deleteImportantDate: async (id) => {
        await deleteImportantDateMutation.mutateAsync(id);
      },
    }),
    [
      couple,
      memoriesQuery.data,
      importantDatesQuery.data,
      coupleQuery.isLoading,
      daysInLove,
      monthsInLove,
      yearsInLove,
      hoursInLove,
      minutesInLove,
      nextMilestone,
      todayQuote,
    ]
  );

  return <LoveContext.Provider value={value}>{children}</LoveContext.Provider>;
}

export function useLove() {
  const context = useContext(LoveContext);
  if (!context) {
    throw new Error("useLove must be used within a LoveProvider");
  }
  return context;
}
