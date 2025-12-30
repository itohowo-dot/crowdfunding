"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCampaigns() {
  const { data, error, mutate } = useSWR('/api/campaigns', fetcher);

  return {
    campaigns: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useCampaign(campaignId: number) {
  const { data, error, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}` : null,
    fetcher
  );

  return {
    campaign: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useContributions(campaignId: number) {
  const { data, error, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}/contributions` : null,
    fetcher
  );

  return {
    contributions: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useMilestones(campaignId: number) {
  const { data, error, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}/milestones` : null,
    fetcher
  );

  return {
    milestones: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useUserContributions(address: string) {
  const { data, error, mutate } = useSWR(
    address ? `/api/users/${address}/contributions` : null,
    fetcher
  );

  return {
    contributions: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
