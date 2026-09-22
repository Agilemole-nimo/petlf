"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type Site = {
  id: string;
  name: string;
  domain: string;
  status: "正常" | "待配置";
};

const initialSites: Site[] = [
  { id: "main", name: "PETLF 主站", domain: "petlf.com", status: "正常" },
  {
    id: "demo",
    name: "品牌内容站",
    domain: "stories.petlf.com",
    status: "待配置",
  },
];

type SiteContextValue = {
  sites: Site[];
  activeSite: Site;
  selectSite: (id: string) => void;
  addSite: (site: Omit<Site, "id" | "status">) => Promise<void>;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: PropsWithChildren) {
  const [sites, setSites] = useState(initialSites);
  const [activeId, setActiveId] = useState(initialSites[0]!.id);
  const activeSite = sites.find((site) => site.id === activeId) ?? sites[0] ?? initialSites[0]!;
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/sites`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          body: {
            data?: Array<{
              id: string;
              name: string;
              domain: string;
              status: string;
            }>;
          } | null,
        ) => {
          if (!body?.data?.length) return;
          const next = body.data.map((site) => ({
            ...site,
            status:
              site.status === "ACTIVE"
                ? ("正常" as const)
                : ("待配置" as const),
          }));
          setSites(next);
          setActiveId((current) =>
            next.some((site) => site.id === current) ? current : next[0]!.id,
          );
        },
      )
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  const value = useMemo<SiteContextValue>(
    () => ({
      sites,
      activeSite,
      selectSite: setActiveId,
      addSite: async ({ name, domain }) => {
        let site: Site = {
          id: crypto.randomUUID(),
          name,
          domain,
          status: "待配置",
        };
        try {
          const csrf =
            document.cookie
              .split("; ")
              .find((item) => item.startsWith("qixu_csrf="))
              ?.split("=")[1] ??
            "";
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/sites`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": decodeURIComponent(csrf),
              },
              body: JSON.stringify({ name, domain }),
            },
          );
          if (response.ok) {
            const body = (await response.json()) as { data: Site };
            site = { ...body.data, status: "待配置" };
          }
        } catch {
          /* Local static preview keeps the site in memory. */
        }
        setSites((current) => [...current, site]);
        setActiveId(site.id);
      },
    }),
    [sites, activeSite],
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside SiteProvider");
  return context;
}
