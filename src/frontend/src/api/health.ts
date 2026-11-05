export type HealthStatus = {
  status: string;
  database: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5139";

export async function getHealth(): Promise<HealthStatus> {
  const response = await fetch(`${apiBaseUrl}/api/health`);

  if (!response.ok) {
    throw new Error("API request failed.");
  }

  return response.json() as Promise<HealthStatus>;
}
